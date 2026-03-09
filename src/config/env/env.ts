export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  isProduction: process.env.NODE_ENV === 'production',
  /** Comma-separated origins for CORS (e.g. https://admin.cardapio.nexoracloud.com.br). Empty = allow all. */
  corsOrigins: process.env.CORS_ORIGINS ?? '',
};
