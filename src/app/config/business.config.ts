/**
 * Public store settings consumed by the storefront.
 *
 * IMPORTANT: this is a FRONTEND placeholder that mirrors the shape of the public
 * settings API (owned by the admin/backend work). It exists so the UI has a
 * single, configurable source instead of hard-coded values scattered across
 * components. Once the public settings endpoint exists, a settings service will
 * hydrate this shape from the backend and admin edits will flow through.
 *
 * Contact fields are intentionally `null` until REAL values are configured — the
 * storefront must never publish fabricated phone/WhatsApp/email details. The UI
 * conditionally renders each channel only when a value is present.
 *
 * Delivery/GST values are configuration, not business logic — nothing is
 * hard-coded into pricing paths; helpers read from here.
 */
export interface StoreSettings {
  businessName: string;
  legalName: string;
  tagline: string;
  domain: string;

  supportEmail: string | null;
  supportPhone: string | null;
  whatsappNumber: string | null;
  businessHours: string | null;

  address: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
  } | null;

  pickupInstructions: string | null;

  deliveryEnabled: boolean;
  storePickupEnabled: boolean;
  standardDeliveryFee: number;
  /** null = no free-delivery promotion configured. */
  freeDeliveryThreshold: number | null;

  tax: {
    enabled: boolean;
    label: string;
    ratePercent: number;
    /** true = displayed prices already include tax. */
    inclusive: boolean;
  };
}

export const SETTINGS: StoreSettings = {
  businessName: 'EZONE',
  legalName: 'Ezone SG',
  tagline: 'Singapore electronics, made simple.',
  domain: 'ezone.sg',

  // Not configured yet — do not publish fabricated contact details.
  supportEmail: null,
  supportPhone: null,
  whatsappNumber: null,
  businessHours: null,
  address: null,
  pickupInstructions: null,

  deliveryEnabled: true,
  storePickupEnabled: true,
  standardDeliveryFee: 8,
  freeDeliveryThreshold: 500,

  tax: {
    enabled: false, // SG GST configurable by admin; off until confirmed.
    label: 'GST',
    ratePercent: 9,
    inclusive: true,
  },
};

/** `wa.me` link, or null when no WhatsApp number is configured. */
export function whatsappLink(settings: StoreSettings = SETTINGS): string | null {
  if (!settings.whatsappNumber) return null;
  const digits = settings.whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

/** Delivery fee for a delivery order at a given subtotal (0 = free/threshold met). */
export function deliveryFeeFor(subtotal: number, settings: StoreSettings = SETTINGS): number {
  if (!settings.deliveryEnabled || subtotal <= 0) return 0;
  const threshold = settings.freeDeliveryThreshold;
  if (threshold != null && subtotal >= threshold) return 0;
  return settings.standardDeliveryFee;
}

/** Tax amount for a taxable base (0 when tax disabled or prices are inclusive). */
export function taxFor(base: number, settings: StoreSettings = SETTINGS): number {
  if (!settings.tax.enabled || settings.tax.inclusive) return 0;
  return Math.round(base * settings.tax.ratePercent) / 100;
}
