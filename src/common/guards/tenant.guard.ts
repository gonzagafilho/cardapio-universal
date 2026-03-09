import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    const tenantIdFromParams = request.params?.tenantId;
    const tenantIdFromQuery = request.query?.tenantId;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant não identificado');
    }

    const requestedTenantId = tenantIdFromParams || tenantIdFromQuery;
    if (requestedTenantId && requestedTenantId !== user.tenantId) {
      throw new ForbiddenException('Acesso negado a este tenant');
    }

    return true;
  }
}
