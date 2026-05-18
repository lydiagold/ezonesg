import { Component, Input, inject, signal, computed } from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);

  added = signal(false);

  isInCart = computed(() => this.cartService.isInCart(this.product.id));

  addToCart(): void {
    this.cartService.addToCart(this.product);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  orderOnWhatsApp(): void {
    this.cartService.orderSingleProduct(this.product);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://placehold.co/400x300/4A7C2F/FFF8F0?text=${encodeURIComponent(this.product.name)}`;
  }

  get discountPercent(): number | null {
    if (this.product.oldPrice && this.product.oldPrice > this.product.price) {
      return Math.round((1 - this.product.price / this.product.oldPrice) * 100);
    }
    return null;
  }
}
