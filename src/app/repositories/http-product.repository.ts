import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductRepository } from './product.repository';
import { Product, CategorySlug } from '../models/product.model';
import { environment } from '../../environments/environment';

/**
 * Phase 2 HTTP product repository — talks to the API Gateway HTTP API.
 * Drop-in replacement for {@link MockProductRepository}; bound in main.ts when
 * `environment.useMock` is false. Components are unaffected.
 */
@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api`;

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`);
  }

  getBySlug(slug: string): Observable<Product | undefined> {
    return this.http
      .get<Product>(`${this.base}/products/${encodeURIComponent(slug)}`)
      .pipe(map(p => p ?? undefined));
  }

  byCategory(category: CategorySlug): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`, {
      params: { category },
    });
  }

  featured(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.base}/products`)
      .pipe(map(list => list.filter(p => p.featured)));
  }

  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`, {
      params: { q: query },
    });
  }
}
