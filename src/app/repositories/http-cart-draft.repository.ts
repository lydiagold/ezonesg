import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartDraftRepository } from './cart-draft.repository';
import {
  CartDraft,
  CartItemInput,
  CreateCartInput,
  CartDraftCustomer,
} from '../models/cart-draft.model';
import { environment } from '../../environments/environment';

/**
 * Phase-2 HTTP cart repository — calls the `/api/v1/carts` endpoints. The opaque
 * cart token is the only cart reference the browser holds. Drop-in replacement
 * for {@link MockCartDraftRepository}; bound when `environment.useMock` is false.
 */
@Injectable()
export class HttpCartDraftRepository extends CartDraftRepository {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1/carts`;

  create(input: CreateCartInput): Observable<CartDraft> {
    return this.http.post<CartDraft>(this.base, input);
  }

  get(token: string): Observable<CartDraft | undefined> {
    return this.http
      .get<CartDraft>(`${this.base}/${encodeURIComponent(token)}`)
      .pipe(catchError(() => of(undefined)));
  }

  patch(
    token: string,
    patch: { customer?: CartDraftCustomer; terms?: CreateCartInput['terms'] }
  ): Observable<CartDraft> {
    return this.http.patch<CartDraft>(`${this.base}/${encodeURIComponent(token)}`, patch);
  }

  addItem(token: string, item: CartItemInput): Observable<CartDraft> {
    return this.http.post<CartDraft>(`${this.base}/${encodeURIComponent(token)}/items`, item);
  }

  updateItem(token: string, itemId: string, quantity: number): Observable<CartDraft> {
    return this.http.patch<CartDraft>(
      `${this.base}/${encodeURIComponent(token)}/items/${encodeURIComponent(itemId)}`,
      { quantity }
    );
  }

  removeItem(token: string, itemId: string): Observable<CartDraft> {
    return this.http.delete<CartDraft>(
      `${this.base}/${encodeURIComponent(token)}/items/${encodeURIComponent(itemId)}`
    );
  }
}
