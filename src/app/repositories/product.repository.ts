import { Observable } from 'rxjs';
import { Product, CategorySlug } from '../models/product.model';

/**
 * Data-access seam for products. Phase 1 binds this to {@link MockProductRepository}
 * (in-memory seed data); Phase 2 will bind an HttpProductRepository hitting
 * `GET /api/products` — with no component changes.
 *
 * Provided as an abstract class so it doubles as the Angular DI token.
 */
export abstract class ProductRepository {
  abstract list(): Observable<Product[]>;
  abstract getBySlug(slug: string): Observable<Product | undefined>;
  abstract byCategory(category: CategorySlug): Observable<Product[]>;
  abstract featured(): Observable<Product[]>;
  abstract search(query: string): Observable<Product[]>;
}
