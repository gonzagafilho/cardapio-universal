export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  isActive: boolean;
  tenantId?: string;
}

export interface StoreSettings {
  id?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  openHours?: OpenHoursMap | null;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  acceptsDineIn: boolean;
  pixKey?: string | null;
  minimumOrder?: number | null;
  deliveryEstimate?: number | null;
}

export type OpenHoursMap = Record<
  string,
  { open: string; close: string } | null
>;
