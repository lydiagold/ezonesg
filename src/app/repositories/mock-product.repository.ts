import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductRepository } from './product.repository';
import { Product, CategorySlug } from '../models/product.model';
import { SEED_PRODUCTS } from '../data/seed-products.data';

/**
 * Phase 1 in-memory product repository backed by clearly-marked development
 * SEED data. Not real EZONE inventory. Replaced by an HTTP repository in Phase 2.
 */
@Injectable()
export class MockProductRepository extends ProductRepository {
  private readonly products: Product[] = SEED_PRODUCTS.filter(p => p.active);

  list(): Observable<Product[]> {
    return of(this.products);
  }

  getBySlug(slug: string): Observable<Product | undefined> {
    return of(this.products.find(p => p.slug === slug));
  }

  byCategory(category: CategorySlug): Observable<Product[]> {
    return of(this.products.filter(p => p.category === category));
  }

  featured(): Observable<Product[]> {
    return of(this.products.filter(p => p.featured));
  }

  search(query: string): Observable<Product[]> {
    const q = query.toLowerCase().trim();
    if (!q) return of(this.products);
    return of(
      this.products.filter(p =>
        [p.name, p.brand, p.sku, p.category, ...p.variants.map(v => v.sku)]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    );
  }
}
