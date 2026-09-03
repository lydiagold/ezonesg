import { Observable } from 'rxjs';
import { Order, CheckoutRequest, CheckoutResponse } from '../models/order.model';

/**
 * Data-access seam for orders/checkout. Phase 1 uses {@link MockOrderRepository}
 * (localStorage, no real payment). Phase 4 binds an HTTP repository that calls
 * `POST /api/checkout` — where the server computes the authoritative total and
 * creates a real HitPay payment. The browser total is NEVER trusted.
 */
export abstract class OrderRepository {
  abstract checkout(request: CheckoutRequest): Observable<CheckoutResponse>;
  abstract getByReference(orderReference: string): Observable<Order | undefined>;
}
