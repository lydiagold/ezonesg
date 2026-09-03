import { Component, Input, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  Product,
  compareAtPrice,
  effectivePrice,
  inStock,
  totalStock,
} from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  @Input({ required: true }) product!: Product;

  readonly justAdded = signal(false);

  get price(): number { return effectivePrice(this.product); }
  get oldPrice(): number | undefined { return compareAtPrice(this.product); }
  get available(): boolean { return inStock(this.product); }
  get lowStock(): boolean {
    const s = totalStock(this.product);
    return s > 0 && s <= 3;
  }

  /** Products with a single variant can be added straight from the card. */
  get hasChoices(): boolean { return this.product.variants.length > 1; }

  addOrChoose(): void {
    if (!this.available) return;
    if (this.hasChoices) {
      this.router.navigate(['/product', this.product.slug]);
      return;
    }
    const variant = this.product.variants.find(v => v.active && v.stockQuantity > 0);
    if (!variant) return;
    this.cart.add(this.product, variant, 1);
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1500);
  }
}
