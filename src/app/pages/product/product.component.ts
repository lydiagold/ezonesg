import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { SeoService } from '../../services/seo.service';
import {
  Product,
  ProductVariant,
  effectivePrice,
  compareAtPrice,
} from '../../models/product.model';

interface Dimension {
  name: string;
  values: string[];
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly seo = inject(SeoService);

  readonly product = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => this.products.bySlug(params.get('slug') ?? ''))
    ),
    { initialValue: undefined }
  );

  readonly activeImage = signal(0);
  readonly quantity = signal(1);
  /** Currently selected attribute value per dimension, e.g. { Storage: '256GB' }. */
  readonly selected = signal<Record<string, string>>({});
  readonly justAdded = signal(false);

  /** Distinct attribute dimensions across the product's variants. */
  readonly dimensions = computed<Dimension[]>(() => {
    const p = this.product();
    if (!p) return [];
    const map = new Map<string, Set<string>>();
    for (const v of p.variants) {
      for (const [k, val] of Object.entries(v.attributes)) {
        if (!map.has(k)) map.set(k, new Set());
        map.get(k)!.add(val);
      }
    }
    return [...map.entries()].map(([name, values]) => ({ name, values: [...values] }));
  });

  readonly currentVariant = computed<ProductVariant | undefined>(() => {
    const p = this.product();
    if (!p) return undefined;
    if (p.variants.length === 1) return p.variants[0];
    const sel = this.selected();
    return p.variants.find(v =>
      Object.entries(v.attributes).every(([k, val]) => sel[k] === val)
    );
  });

  readonly unitPrice = computed(() => {
    const p = this.product();
    const v = this.currentVariant();
    if (!p) return 0;
    return v?.priceOverride ?? effectivePrice(p);
  });

  readonly oldPrice = computed(() => {
    const p = this.product();
    return p ? compareAtPrice(p) : undefined;
  });

  readonly stock = computed(() => this.currentVariant()?.stockQuantity ?? 0);
  readonly canAdd = computed(() => this.stock() >= this.quantity() && this.quantity() > 0);

  readonly specs = computed(() => {
    const p = this.product();
    return p ? Object.entries(p.attributes) : [];
  });

  constructor() {
    // When a product loads (or changes), default selection to the first
    // in-stock variant and reset the gallery/quantity, then apply SEO.
    effect(() => {
      const p = this.product();
      if (!p) return;
      const def = p.variants.find(v => v.active && v.stockQuantity > 0) ?? p.variants[0];
      this.selected.set({ ...(def?.attributes ?? {}) });
      this.activeImage.set(0);
      this.quantity.set(1);
      this.applySeo(p);
    }, { allowSignalWrites: true });
  }

  select(dimension: string, value: string): void {
    this.selected.update(s => ({ ...s, [dimension]: value }));
  }

  isSelected(dimension: string, value: string): boolean {
    return this.selected()[dimension] === value;
  }

  changeQty(delta: number): void {
    this.quantity.update(q => Math.min(Math.max(1, q + delta), Math.max(1, this.stock())));
  }

  addToCart(): boolean {
    const p = this.product();
    const v = this.currentVariant();
    if (!p || !v || !this.canAdd()) return false;
    this.cart.add(p, v, this.quantity());
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1500);
    return true;
  }

  buyNow(): void {
    if (this.addToCart()) this.router.navigate(['/checkout']);
  }

  private applySeo(p: Product): void {
    this.seo.update({
      title: p.name,
      description: p.shortDescription,
      path: `/product/${p.slug}`,
      image: p.images[0]?.url,
      type: 'product',
    });
  }
}
