import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrderRepository } from './order.repository';
import { ProductRepository } from './product.repository';
import {
  Order,
  OrderItem,
  CheckoutRequest,
  CheckoutResponse,
} from '../models/order.model';
import { effectivePrice } from '../models/product.model';
import { deliveryFeeFor } from '../config/business.config';
import { map } from 'rxjs/operators';

const ORDERS_KEY = 'ezone_orders';
const COUNTER_KEY = 'ezone_order_counter';

/**
 * Phase 1 in-memory / localStorage order repository. NO REAL PAYMENT is taken.
 *
 * It mirrors the *server-side* checkout contract for realism: it recomputes the
 * authoritative total from the catalogue (ignoring any client-supplied amount)
 * and validates stock. In production (Phase 4) this logic lives in Lambda and
 * an order only becomes PAID via the verified HitPay webhook — never client-side.
 */
@Injectable()
export class MockOrderRepository extends OrderRepository {
  private readonly products = inject(ProductRepository);

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.products.list().pipe(
      map(catalogue => {
        const items: OrderItem[] = [];

        for (const line of request.items) {
          const product = catalogue.find(p => p.id === line.productId);
          if (!product) throw new Error(`Product not available: ${line.productId}`);
          const variant = product.variants.find(v => v.id === line.variantId && v.active);
          if (!variant) throw new Error(`Option not available for ${product.name}`);
          if (line.quantity < 1) throw new Error('Invalid quantity');
          if (variant.stockQuantity < line.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          // Authoritative unit price from the catalogue, NOT from the browser.
          const unitPrice = variant.priceOverride ?? effectivePrice(product);
          const variantDescription = Object.entries(variant.attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');

          items.push({
            productId: product.id,
            productName: product.name,
            sku: variant.sku,
            variantId: variant.id,
            variantDescription,
            unitPrice,
            quantity: line.quantity,
            lineTotal: unitPrice * line.quantity,
            productImage: product.images[0]?.url ?? '',
          });
        }

        const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
        const discount = 0;
        const deliveryFee = deliveryFeeFor(subtotal);
        const total = subtotal - discount + deliveryFee;

        const now = new Date().toISOString();
        const orderReference = this.nextReference();

        const order: Order = {
          id: orderReference,
          orderReference,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          customerMobile: request.customerMobile,
          shippingAddress: request.shippingAddress,
          items,
          subtotal,
          discount,
          deliveryFee,
          total,
          currency: 'SGD',
          // Phase 1 mock: represents a completed sandbox purchase. In production
          // the order is created PENDING_PAYMENT and only the webhook sets PAID.
          status: 'PAID',
          paymentProvider: 'hitpay',
          providerPaymentId: `mock_${orderReference}`,
          paymentStatus: 'COMPLETED',
          createdAt: now,
          paidAt: now,
          updatedAt: now,
        };

        this.persist(order);

        return {
          orderReference,
          // Phase 1: no external gateway — route straight to the return page.
          paymentUrl: `/checkout/success?ref=${orderReference}`,
        };
      })
    );
  }

  getByReference(orderReference: string): Observable<Order | undefined> {
    return of(this.readAll().find(o => o.orderReference === orderReference));
  }

  private nextReference(): string {
    const year = new Date().getFullYear();
    const raw = Number(localStorage.getItem(COUNTER_KEY) ?? '0') + 1;
    localStorage.setItem(COUNTER_KEY, String(raw));
    return `EZ-${year}-${String(raw).padStart(6, '0')}`;
  }

  private readAll(): Order[] {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(order: Order): void {
    const all = this.readAll();
    all.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  }
}
