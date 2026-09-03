import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { HomepageService } from '../../services/homepage.service';
import { SETTINGS, whatsappLink } from '../../config/business.config';
import { DEFAULT_HOMEPAGE } from '../../models/homepage.model';

/**
 * Homepage. Content (hero, category cards, featured order, why-shop, contact CTA)
 * is served by GET /api/homepage and managed by the admin — with a built-in
 * default fallback (see HomepageService) so the page always renders, including in
 * mock mode. No code deploy is needed to change homepage copy or imagery.
 */
@Component({
  selector: 'app-ez-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './ez-home.component.html',
  styleUrl: './ez-home.component.scss',
})
export class EzHomeComponent implements OnInit {
  private readonly products = inject(ProductService);
  private readonly seo = inject(SeoService);
  private readonly homepage = inject(HomepageService);

  readonly settings = SETTINGS;
  readonly whatsapp = whatsappLink();

  /** Admin-managed homepage config (falls back to defaults). */
  readonly cfg = toSignal(this.homepage.get(), { initialValue: DEFAULT_HOMEPAGE });

  private readonly allFeatured = toSignal(this.products.featured(), { initialValue: [] });
  private readonly allProducts = toSignal(this.products.all(), { initialValue: [] });

  /** Featured list honours the admin ordering when set, else the product flag. */
  readonly featured = computed(() => {
    const ids = this.cfg().featured?.productIds ?? [];
    if (!ids.length) return this.allFeatured();
    const byId = new Map(this.allProducts().map(p => [p.id, p]));
    return ids.map(id => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
  });

  readonly activeCards = computed(() =>
    [...(this.cfg().categoryCards?.items ?? [])].filter(c => c.active).sort((a, b) => a.order - b.order));
  readonly activeReasons = computed(() =>
    [...(this.cfg().whyShop?.items ?? [])].filter(r => r.active).sort((a, b) => a.order - b.order));

  isSectionActive(key: string): boolean {
    const s = this.cfg().sections?.find(x => x.key === key);
    return s ? s.active : true;
  }

  /** Only surface a free-delivery message when it's actually configured. */
  readonly freeDeliveryText = computed(() => {
    const s = SETTINGS;
    if (!s.deliveryEnabled || s.freeDeliveryThreshold == null) return null;
    return `Free delivery over $${s.freeDeliveryThreshold}`;
  });

  readonly categoryImages: Record<string, string> = {
    phones: 'assets/images/seed/phone.svg',
    tablets: 'assets/images/seed/tablet.svg',
    accessories: 'assets/images/seed/accessory.svg',
  };

  /** Choose a seed thumbnail for a card by its destination URL (fallback only). */
  cardImage(url: string): string {
    if (url.includes('tablet')) return this.categoryImages['tablets'];
    if (url.includes('accessor')) return this.categoryImages['accessories'];
    return this.categoryImages['phones'];
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Electronics Store Singapore',
      description:
        'EZONE — buy iPhones, EZONE tablets and accessories in Singapore. Genuine products, fast delivery, secure checkout.',
      path: '/',
    });
  }
}
