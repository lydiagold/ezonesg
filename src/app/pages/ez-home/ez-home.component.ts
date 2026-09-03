import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { BUSINESS } from '../../config/business.config';

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

  readonly business = BUSINESS;
  readonly featured = toSignal(this.products.featured(), { initialValue: [] });

  readonly reasons = [
    { title: 'Genuine products', desc: 'Authentic iPhones and EZONE devices with local warranty.' },
    { title: 'Fast SG delivery', desc: 'Islandwide delivery, free above $500.' },
    { title: 'Secure checkout', desc: 'Pay safely with PayNow and cards via HitPay.' },
    { title: 'Real support', desc: 'Talk to a real person on WhatsApp, Mon–Sat.' },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Electronics Store Singapore',
      description:
        'EZONE — buy iPhones, EZONE tablets and accessories in Singapore. Genuine products, fast delivery, secure PayNow & card checkout.',
      path: '/',
    });
  }
}
