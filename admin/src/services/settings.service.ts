import { apiGet, apiPatch } from './api';

export async function getStoreSettings(establishmentId: string) {
  return apiGet(`/settings/store?establishmentId=${establishmentId}`);
}

export async function updateStoreSettings(establishmentId: string, data: Record<string, unknown>) {
  return apiPatch(`/settings/store?establishmentId=${establishmentId}`, data);
}

export async function updateHours(establishmentId: string, openHours: Record<string, { open: string; close: string }>) {
  return apiPatch(`/settings/hours?establishmentId=${establishmentId}`, { openHours });
}

export async function updateBranding(
  establishmentId: string,
  data: { primaryColor?: string; secondaryColor?: string; accentColor?: string }
) {
  return apiPatch(`/settings/branding?establishmentId=${establishmentId}`, data);
}
