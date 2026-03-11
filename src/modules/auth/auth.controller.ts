import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService, AuthResponse, TokenPair } from './auth.service';
import { OnboardingService } from './onboarding.service';
import { LoginDto, RefreshTokenDto, OnboardingDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipTrialCheck } from '../../common/decorators/skip-trial-check.decorator';

/** Rotas login e onboarding são candidatas a rate limit (Throttler/Redis) quando houver mitigação de abuso. */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Public()
  @Post('onboarding')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastro inicial (tenant + estabelecimento + usuário dono)' })
  async onboarding(@Body() dto: OnboardingDto): Promise<AuthResponse> {
    return this.onboardingService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout (invalidate client-side)' })
  async logout() {
    return { message: 'Logout realizado' };
  }

  @Get('me')
  @SkipTrialCheck()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Usuário autenticado' })
  async me(@CurrentUser('sub') userId: string) {
    return this.authService.me(userId);
  }
}
