import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { SeoService } from '../../services/seo.service';
import { CATEGORIES } from '../../config/nav.config';
import { CategorySlug, Product } from '../../models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductService);
  private readonly seo = inject(SeoService);

  readonly categories = CATEGORIES;

  private readonly view$ = combineLatest([
    this.route.data,
    this.route.queryParamMap,
  ]).pipe(
    map(([data, params]) => ({
      category: (data['category'] as CategorySlug | undefined) ?? undefined,
      query: params.get('q')?.trim() ?? '',
    })),
    tap(({ category, query }) => this.applySeo(category, query)),
    switchMap(({ category, query }) => this.load(category, query))
  );

  readonly state = toSignal(this.view$, {
    initialValue: { category: undefined, query: '', results: [] as Product[] },
  });

  readonly heading = computed(() => {
    const { category, query } = this.state();
    if (query) return `Results for “${query}”`;
    if (category) return this.products.categoryBySlug(category)?.name ?? 'Shop';
    return 'All products';
  });

  private load(category: CategorySlug | undefined, query: string) {
    const source$ = query
      ? this.products.search(query)
      : category
        ? this.products.byCategory(category)
        : this.products.all();

    return source$.pipe(
      map(list => ({
        category,
        query,
        results:
          query && category ? list.filter(p => p.category === category) : list,
      }))
    );
  }

  private applySeo(category: CategorySlug | undefined, query: string): void {
    const cat = category ? this.products.categoryBySlug(category) : undefined;
    this.seo.update({
      title: query ? `Search: ${query}` : cat?.name ?? 'Shop',
      description: cat?.tagline ?? 'Browse iPhones, EZONE tablets and accessories at EZONE Singapore.',
      path: category ? `/shop/${category}` : '/shop',
    });
  }
}
