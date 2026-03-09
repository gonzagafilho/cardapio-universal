/**
 * Usuário autenticado no contexto da requisição (request.user).
 * Preenchido pelo JwtStrategy a partir do payload JWT e do banco.
 */
export interface AuthUser {
  sub: string;
  email: string;
  tenantId: string;
  establishmentId?: string | null;
  role: string;
}
