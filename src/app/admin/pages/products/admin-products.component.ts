import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../admin-api.service';
import { Product, effectivePrice, totalStock } from '../../../models/product.model';

@Component({
  selector: 'ez-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page-head">
      <div><h1>Products</h1><p>{{ products().length }} product(s)</p></div>
      <a routerLink="/admin/products/new" class="btn btn-primary btn-sm">+ Add Product</a>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>

    <div class="admin-toolbar">
      <input class="input" placeholder="Search name, SKU, brand…" [(ngModel)]="query" (ngModelChange)="q.set($event)" />
      <select class="select" [(ngModel)]="cat" (ngModelChange)="category.set($event)">
        <option value="">All categories</option>
        <option value="phones">iPhones</option>
        <option value="tablets">Tablets</option>
        <option value="accessories">Accessories</option>
      </select>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Product</th><th>Category</th><th>SKU</th><th class="num">Price</th><th class="num">Stock</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filtered()">
            <td>
              <div style="display:flex;align-items:center;gap:0.6rem">
                <img [src]="thumb(p)" alt="" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:var(--ez-surface-muted)" />
                <div>
                  <div style="font-weight:600">{{ p.name }}</div>
                  <div class="muted" style="font-size:0.78rem">{{ p.brand }}<span *ngIf="p.featured"> · ★ Featured</span></div>
                </div>
              </div>
            </td>
            <td>{{ p.category }}</td>
            <td>{{ p.sku }}</td>
            <td class="num">{{ price(p) | currency:'SGD':'symbol-narrow' }}</td>
            <td class="num">{{ stock(p) }}</td>
            <td>
              <span class="badge" [class.badge-success]="p.active && !p.archived" [class.badge-muted]="!p.active || p.archived">
                {{ p.archived ? 'Archived' : (p.active ? 'Active' : 'Inactive') }}
              </span>
            </td>
            <td>
              <div class="admin-row-actions">
                <a [routerLink]="['/admin/products', p.id]" class="btn btn-outline btn-sm">Edit</a>
              </div>
            </td>
          </tr>
          <tr *ngIf="!loading() && !filtered().length"><td colspan="7" class="admin-empty">No products match.</td></tr>
          <tr *ngIf="loading()"><td colspan="7" class="admin-empty">Loading…</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class AdminProductsComponent {
  private readonly api = inject(AdminApiService);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  query = ''; cat = '';
  readonly q = signal('');
  readonly category = signal('');

  readonly filtered = computed(() => {
    const q = this.q().toLowerCase().trim();
    const c = this.category();
    return this.products().filter(p => {
      if (c && p.category !== c) return false;
      if (!q) return true;
      return [p.name, p.brand, p.sku, p.category].join(' ').toLowerCase().includes(q);
    });
  });

  constructor() {
    this.api.listProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load products.'); this.loading.set(false); },
    });
  }

  price = (p: Product) => effectivePrice(p);
  stock = (p: Product) => totalStock(p);
  thumb = (p: Product) => p.images?.find(i => i.primary)?.url || p.images?.[0]?.url || 'assets/images/seed/phone.svg';
}
