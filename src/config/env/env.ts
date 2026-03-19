const deploymentModeRaw = (process.env.DEPLOYMENT_MODE ?? 'saas').toLowerCase().trim();
const deploymentMode = deploymentModeRaw === 'onprem' ? 'onprem' : 'saas';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  isProduction: process.env.NODE_ENV === 'production',
  /** Comma-separated origins for CORS (e.g. https://admin.cardapio.nexoracloud.com.br). Empty = allow all. */
  corsOrigins: process.env.CORS_ORIGINS ?? '',
  /** Deployment mode: saas (default) or onprem. */
  deploymentMode,
  isOnPrem: deploymentMode === 'onprem',
  /** Local license gate used only in onprem mode. */
  onPremLicenseValid: (process.env.ONPREM_LICENSE_VALID ?? 'true').toLowerCase() === 'true',
  /** Public onboarding availability in onprem mode. */
  onPremAllowPublicOnboarding:
    (process.env.ONPREM_ALLOW_PUBLIC_ONBOARDING ?? 'false').toLowerCase() === 'true',
};
