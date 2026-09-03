import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { SETTINGS, whatsappLink } from '../../config/business.config';
import { CATEGORIES } from '../../config/nav.config';

/**
 * Homepage. Content that an admin will manage in Increment F (hero, banners,
 * category cards, why-shop, contact CTA) is currently sourced from frontend
 * config/SEED — clearly a placeholder for the future homepage settings API.
 */
@Component({
  selector: 'app-ez-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './ez-home.component.html',
  styleUrl: './ez-home.component.scss',
})
export class EzHomeComponent implements OnInit {
  private readonly products = inject(ProductService);
  private readonly seo = inject(SeoService);

  readonly settings = SETTINGS;
  readonly whatsapp = whatsappLink();
  readonly categories = CATEGORIES;
  readonly featured = toSignal(this.products.featured(), { initialValue: [] });

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

  readonly reasons = [
    { title: 'Genuine products', desc: 'Authentic iPhones and EZONE devices with local warranty.' },
    { title: 'Fast SG delivery', desc: 'Islandwide delivery across Singapore.' },
    { title: 'Secure checkout', desc: 'Payments handled securely by our payment provider.' },
    { title: 'Real support', desc: 'Talk to a real person about your order.' },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Electronics Store Singapore',
      description:
        'EZONE — buy iPhones, EZONE tablets and accessories in Singapore. Genuine products, fast delivery, secure checkout.',
      path: '/',
    });
  }
}
