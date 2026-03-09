import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY, ROLES, Role } from '../constants/roles';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const userRole = user?.role as Role;
    const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;
    const hasRequiredRole = requiredRoles.includes(userRole);
    const hasHigherRole = requiredRoles.some(
      (role) => (ROLE_HIERARCHY[userRole] ?? 0) >= ROLE_HIERARCHY[role],
    );
    if (!isSuperAdmin && !hasRequiredRole && !hasHigherRole) {
      throw new ForbiddenException('Sem permissão para esta ação');
    }
    return true;
  }
}
