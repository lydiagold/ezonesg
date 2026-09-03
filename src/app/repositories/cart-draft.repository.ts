import { Observable } from 'rxjs';
import {
  CartDraft,
  CartItemInput,
  CreateCartInput,
  CartDraftCustomer,
} from '../models/cart-draft.model';

/**
 * Data-access seam for the server-side cart / order-draft.
 *
 * Phase-1 binding is {@link MockCartDraftRepository} (localStorage; mirrors the
 * server contract). {@link HttpCartDraftRepository} calls the real
 * `/api/v1/carts` endpoints when `environment.useMock` is false — with no
 * component changes.
 */
export abstract class CartDraftRepository {
  abstract create(input: CreateCartInput): Observable<CartDraft>;
  abstract get(token: string): Observable<CartDraft | undefined>;
  abstract patch(
    token: string,
    patch: { customer?: CartDraftCustomer; terms?: CreateCartInput['terms'] }
  ): Observable<CartDraft>;
  abstract addItem(token: string, item: CartItemInput): Observable<CartDraft>;
  abstract updateItem(token: string, itemId: string, quantity: number): Observable<CartDraft>;
  abstract removeItem(token: string, itemId: string): Observable<CartDraft>;
}
