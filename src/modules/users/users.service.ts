import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role as PrismaRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ROLES } from '../../common/constants/roles';

function toPrismaRole(role: string): PrismaRole {
  const map: Record<string, PrismaRole> = {
    [ROLES.MANAGER]: PrismaRole.TENANT_ADMIN,
    [ROLES.ATTENDANT]: PrismaRole.TENANT_STAFF,
    [ROLES.OPERATOR]: PrismaRole.TENANT_STAFF,
  };
  return (map[role] ?? role) as PrismaRole;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
  ) {}

  async create(tenantId: string, dto: CreateUserDto) {
    await this.plansService.checkUsersLimit(tenantId);
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado neste tenant');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        tenantId,
        establishmentId: dto.establishmentId ?? undefined,
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: toPrismaRole(dto.role),
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        establishmentId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAll(tenantId: string, establishmentId?: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        ...(establishmentId ? { establishmentId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        establishmentId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        establishmentId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.role != null) data.role = toPrismaRole(dto.role);
    return this.prisma.user.update({
      where: { id },
      data: data as never,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        establishmentId: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuário removido' };
  }
}
