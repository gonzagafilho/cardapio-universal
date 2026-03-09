import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
}));
