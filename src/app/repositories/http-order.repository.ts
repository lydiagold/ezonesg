import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrderRepository } from './order.repository';
import { Order, CheckoutRequest, CheckoutResponse } from '../models/order.model';
import { environment } from '../../environments/environment';

/**
 * Phase 2 HTTP order repository. `checkout` POSTs to `/api/checkout`, where the
 * server computes the authoritative total and creates the order (Phase 4 adds
 * HitPay + the webhook). Drop-in replacement for {@link MockOrderRepository}.
 */
@Injectable()
export class HttpOrderRepository extends OrderRepository {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api`;

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout`, request);
  }

  getByReference(orderReference: string): Observable<Order | undefined> {
    return this.http
      .get<Order>(`${this.base}/orders/${encodeURIComponent(orderReference)}`)
      .pipe(
        map(o => o ?? undefined),
        catchError(() => of(undefined))
      );
  }
}
