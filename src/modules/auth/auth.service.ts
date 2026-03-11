import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  ok: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    establishmentId?: string | null;
  };
  accessToken: string;
  tokens: TokenPair;
  /** Link do cardápio público (apenas no onboarding). */
  publicCardUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, tenantId?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase().trim(),
        ...(tenantId ? { tenantId } : {}),
      },
      include: { tenant: true, establishment: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Usuário inativo');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    return {
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        establishmentId: user.establishmentId ?? undefined,
      },
      accessToken: tokens.accessToken,
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload & { type: string }>(
        refreshToken,
        {
          secret: this.config.get<string>('auth.jwtRefresh.secret'),
        },
      );
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, tenantId: true, establishmentId: true, role: true },
      });
      if (!user?.id) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
      return this.generateTokens(user as { id: string; email: string; tenantId: string; establishmentId: string | null; role: string });
    } catch {
      throw new ForbiddenException('Refresh token inválido ou expirado');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        establishmentId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, slug: true } },
        establishment: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    tenantId: string;
    establishmentId?: string | null;
    role: string;
  }): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      establishmentId: user.establishmentId ?? undefined,
      role: user.role,
      type: 'access',
    };
    const accessSecret = this.config.get<string>('auth.jwt.secret');
    const accessExpires = this.config.get<string>('auth.jwt.expiresIn');
    const refreshSecret = this.config.get<string>('auth.jwtRefresh.secret');
    const refreshExpires = this.config.get<string>('auth.jwtRefresh.expiresIn');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        { secret: accessSecret, expiresIn: accessExpires },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { secret: refreshSecret, expiresIn: refreshExpires },
      ),
    ]);

    const decoded = this.jwtService.decode(accessToken) as { exp?: number };
    const expiresIn = decoded?.exp
      ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
      : 604800;

    return { accessToken, refreshToken, expiresIn };
  }
}
