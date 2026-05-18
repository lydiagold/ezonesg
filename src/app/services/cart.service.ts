import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.cartItems.asReadonly();

  readonly count = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  readonly isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    effect(() => {
      localStorage.setItem('orchardroots_cart', JSON.stringify(this.cartItems()));
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem('orchardroots_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addToCart(product: Product, quantity = 1): void {
    const current = this.cartItems();
    const existing = current.find(i => i.product.id === product.id);
    if (existing) {
      this.cartItems.set(
        current.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      this.cartItems.set([...current, { product, quantity }]);
    }
  }

  removeFromCart(productId: number): void {
    this.cartItems.set(this.cartItems().filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cartItems.set(
      this.cartItems().map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(i => i.product.id === productId);
  }

  checkout(): void {
    const items = this.cartItems();
    if (items.length === 0) return;

    let message = 'Hello OrchardRoots! I would like to place an order:\n\n';
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (${item.product.weight}) x${item.quantity} — SGD ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: SGD ${this.total().toFixed(2)}*\n`;
    message += '\nName:\nDelivery Address / Pickup:\nNotes:';

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/6596926272?text=${encoded}`, '_blank');
  }

  orderSingleProduct(product: Product): void {
    const message = `Hello OrchardRoots! I would like to order:\n\n${product.name} (${product.weight}) — SGD ${product.price.toFixed(2)}\n\nName:\nDelivery Address / Pickup:\nNotes:`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/6596926272?text=${encoded}`, '_blank');
  }
}
