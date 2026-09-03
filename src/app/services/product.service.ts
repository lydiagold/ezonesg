import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository } from '../repositories/product.repository';
import { Product, CategorySlug } from '../models/product.model';
import { CATEGORIES } from '../config/nav.config';

/**
 * Thin storefront-facing facade over {@link ProductRepository}. Components depend
 * on this; the underlying repository (mock now, HTTP in Phase 2) stays hidden.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly repo = inject(ProductRepository);

  readonly categories = CATEGORIES;

  all(): Observable<Product[]> {
    return this.repo.list();
  }

  byCategory(category: CategorySlug): Observable<Product[]> {
    return this.repo.byCategory(category);
  }

  bySlug(slug: string): Observable<Product | undefined> {
    return this.repo.getBySlug(slug);
  }

  featured(): Observable<Product[]> {
    return this.repo.featured();
  }

  search(query: string): Observable<Product[]> {
    return this.repo.search(query);
  }

  categoryBySlug(slug: CategorySlug) {
    return this.categories.find(c => c.slug === slug);
  }
}
