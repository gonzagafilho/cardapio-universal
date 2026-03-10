import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getPlanLimits } from '../../common/constants/plans';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna os limites do plano (para exibição ou validação).
   */
  getLimits(plan: string | null | undefined) {
    return getPlanLimits(plan);
  }

  /**
   * Verifica se o tenant pode criar mais estabelecimentos.
   * Lança BadRequestException com mensagem comercial se o limite foi atingido.
   */
  async checkEstablishmentsLimit(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    const limits = getPlanLimits(tenant.plan);
    const count = await this.prisma.establishment.count({
      where: { tenantId },
    });
    if (count >= limits.establishments) {
      throw new BadRequestException(
        `Seu plano atual permite até ${limits.establishments} estabelecimento(s). Para adicionar mais, faça upgrade do seu plano.`,
      );
    }
  }

  /**
   * Verifica se o tenant pode criar mais usuários.
   * Lança BadRequestException com mensagem comercial se o limite foi atingido.
   */
  async checkUsersLimit(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    const limits = getPlanLimits(tenant.plan);
    const count = await this.prisma.user.count({
      where: { tenantId },
    });
    if (count >= limits.users) {
      throw new BadRequestException(
        `Seu plano atual permite até ${limits.users} usuário(s). Para adicionar mais, faça upgrade do seu plano.`,
      );
    }
  }
}
