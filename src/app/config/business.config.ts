/**
 * Central EZONE business configuration. Keep contact details, delivery rules and
 * store info here rather than hard-coding them across components. In Phase 3 the
 * mutable subset is served from the `ezone-settings` DynamoDB table.
 */
export const BUSINESS = {
  name: 'EZONE',
  legalName: 'Ezone SG',
  tagline: 'Singapore electronics, made simple.',
  domain: 'ezone.sg',
  currency: 'SGD',

  email: 'sales@ezone.sg',
  phone: '+65 6000 0000',
  whatsapp: '+6580000000',
  whatsappLink: 'https://wa.me/6580000000',

  address: {
    line1: '1 Marina Boulevard',
    line2: '#00-00',
    city: 'Singapore',
    postalCode: '018989',
  },

  hours: 'Mon–Sat, 10am – 8pm (SGT)',
} as const;

/** Flat-rate delivery fee (SGD), waived above the free-delivery threshold. */
export const DELIVERY_FEE = 8;
export const FREE_DELIVERY_THRESHOLD = 500;

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
