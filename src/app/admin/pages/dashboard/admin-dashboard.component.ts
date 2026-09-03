import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService, DashboardSummary } from '../../admin-api.service';

@Component({
  selector: 'ez-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page-head">
      <div><h1>Dashboard</h1><p>At a glance for {{ today }}</p></div>
      <div class="admin-row-actions">
        <a routerLink="/admin/products/new" class="btn btn-primary btn-sm">+ Add Product</a>
        <a routerLink="/admin/homepage" class="btn btn-outline btn-sm">Edit Homepage</a>
        <a routerLink="/admin/orders" class="btn btn-outline btn-sm">View Orders</a>
        <a routerLink="/admin/inventory" class="btn btn-outline btn-sm">Inventory</a>
      </div>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>

    <ng-container *ngIf="data() as d">
      <div class="admin-stats">
        <div class="admin-stat"><div class="admin-stat__label">Products</div><div class="admin-stat__value">{{ d.products }}</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Low stock</div><div class="admin-stat__value">{{ d.lowStock }}</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Orders today</div><div class="admin-stat__value">{{ d.ordersToday }}</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Pending payment</div><div class="admin-stat__value">{{ d.pendingPayment }}</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Paid orders</div><div class="admin-stat__value">{{ d.paidOrders }}</div></div>
        <div class="admin-stat"><div class="admin-stat__label">Revenue</div><div class="admin-stat__value">{{ d.revenue | currency:d.currency:'symbol-narrow':'1.0-0' }}</div></div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__head">Recent orders <a routerLink="/admin/orders" class="muted" style="font-size:0.82rem">View all</a></div>
        <div class="admin-table-wrap" style="border:none">
          <table class="admin-table">
            <thead><tr><th>Reference</th><th>Customer</th><th>Status</th><th>Payment</th><th class="num">Total</th><th>Placed</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of d.recentOrders">
                <td><a [routerLink]="['/admin/orders', o.orderReference]" style="color:var(--ez-primary-strong);font-weight:600">{{ o.orderReference }}</a></td>
                <td>{{ o.customerName }}</td>
                <td><span class="badge badge-muted">{{ o.status }}</span></td>
                <td><span class="badge" [class.badge-success]="o.paymentStatus==='COMPLETED'" [class.badge-warn]="o.paymentStatus!=='COMPLETED'">{{ o.paymentStatus }}</span></td>
                <td class="num">{{ o.total | currency:o.currency:'symbol-narrow' }}</td>
                <td>{{ o.createdAt | date:'d MMM, h:mm a' }}</td>
              </tr>
              <tr *ngIf="!d.recentOrders.length"><td colspan="6" class="admin-empty">No orders yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <div *ngIf="loading()" class="admin-empty">Loading…</div>
  `,
})
export class AdminDashboardComponent {
  private readonly api = inject(AdminApiService);
  readonly data = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly today = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });

  constructor() {
    this.api.dashboard().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load dashboard.'); this.loading.set(false); },
    });
  }
}
