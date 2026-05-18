import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCTS, CATEGORIES } from '../config/products.config';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private allProducts = signal<Product[]>(PRODUCTS);
  private selectedCategory = signal<string>('All');
  private searchQuery = signal<string>('');

  readonly categories = CATEGORIES;

  readonly allProductsList = this.allProducts.asReadonly();

  readonly featuredProducts = computed(() =>
    this.allProducts().filter(p => p.featured)
  );

  readonly filteredProducts = computed(() => {
    let products = this.allProducts();
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== 'All') {
      products = products.filter(p => p.category === cat);
    }
    if (query) {
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    return products;
  });

  readonly activeCategory = this.selectedCategory.asReadonly();
  readonly activeSearch = this.searchQuery.asReadonly();

  readonly uniqueCategories = computed(() => {
    const cats = ['All', ...new Set(this.allProducts().map(p => p.category))];
    return cats;
  });

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  getProductById(id: number): Product | undefined {
    return this.allProducts().find(p => p.id === id);
  }
}
