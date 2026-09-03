import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem, cartItemKey, lineTotal } from '../models/cart-item.model';
import { Product, ProductVariant, effectivePrice } from '../models/product.model';
import { deliveryFeeFor } from '../config/business.config';

const CART_KEY = 'ezone_cart';

/**
 * Persistent, variant-aware guest cart backed by localStorage.
 * No account required — guest checkout is the default.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + lineTotal(i), 0)
  );

  readonly discount = computed(() => 0);

  readonly deliveryFee = computed(() => deliveryFeeFor(this.subtotal()));

  readonly total = computed(
    () => this.subtotal() - this.discount() + this.deliveryFee()
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => {
      localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
    });
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  add(product: Product, variant: ProductVariant, quantity = 1): void {
    const key = cartItemKey(product.id, variant.id);
    const items = this._items();
    const existing = items.find(
      i => cartItemKey(i.productId, i.variantId) === key
    );

    if (existing) {
      const next = Math.min(existing.quantity + quantity, variant.stockQuantity);
      this.setQuantity(key, next);
      return;
    }

    const unitPrice = variant.priceOverride ?? effectivePrice(product);
    const variantDescription = Object.entries(variant.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const item: CartItem = {
      productId: product.id,
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      variantDescription,
      sku: variant.sku,
      image: product.images[0]?.url ?? '',
      unitPrice,
      quantity: Math.min(quantity, variant.stockQuantity),
      maxQuantity: variant.stockQuantity,
    };
    this._items.set([...items, item]);
  }

  setQuantity(key: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(key);
      return;
    }
    this._items.set(
      this._items().map(i =>
        cartItemKey(i.productId, i.variantId) === key
          ? { ...i, quantity: Math.min(quantity, i.maxQuantity || quantity) }
          : i
      )
    );
  }

  remove(key: string): void {
    this._items.set(
      this._items().filter(
        i => cartItemKey(i.productId, i.variantId) !== key
      )
    );
  }

  clear(): void {
    this._items.set([]);
  }

  keyOf(item: CartItem): string {
    return cartItemKey(item.productId, item.variantId);
  }
}
