import { Currency } from './product.model';

/**
 * Order status machine. The webhook is authoritative for the PAID transition;
 * fulfilment states are advanced by admins.
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  postalCode: string;
  deliveryNotes?: string;
}

/** Immutable snapshot of a purchased line — retains pricing at purchase time. */
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  variantDescription: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  productImage: string;
}

export interface Order {
  id: string;
  orderReference: string; // e.g. EZ-2026-000001

  customerName: string;
  customerEmail: string;
  customerMobile: string;

  shippingAddress: ShippingAddress;

  items: OrderItem[];

  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  currency: Currency;

  status: OrderStatus;

  paymentProvider: 'hitpay';
  providerPaymentId?: string;
  paymentStatus: PaymentStatus;

  createdAt: string;
  paidAt?: string;
  updatedAt: string;
}

/** Customer-submitted checkout payload. NEVER trusted for pricing server-side. */
export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddress: ShippingAddress;
  items: { productId: string; variantId: string; quantity: number }[];
}

/** What the checkout endpoint returns: order ref + HitPay redirect URL. */
export interface CheckoutResponse {
  orderReference: string;
  paymentUrl: string;
}
