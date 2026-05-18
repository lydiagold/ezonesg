import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartService = inject(CartService);

  items = this.cartService.items;
  total = this.cartService.total;
  isEmpty = this.cartService.isEmpty;
  count = this.cartService.count;

  increment(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  decrement(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  remove(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  checkout(): void {
    this.cartService.checkout();
  }

  clearAll(): void {
    if (confirm('Remove all items from cart?')) {
      this.cartService.clearCart();
    }
  }

  onImageError(event: Event, productName: string): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://placehold.co/80x80/4A7C2F/FFF8F0?text=${encodeURIComponent(productName.slice(0, 8))}`;
  }
}
