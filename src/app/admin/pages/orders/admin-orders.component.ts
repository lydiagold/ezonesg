import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../admin-api.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'ez-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page-head"><div><h1>Orders</h1><p>{{ orders().length }} order(s)</p></div></div>
    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>

    <div class="admin-toolbar">
      <select class="select" [(ngModel)]="status" (ngModelChange)="load($event)">
        <option value="">All statuses</option>
        <option value="PENDING_PAYMENT">Pending payment</option>
        <option value="PAID">Paid</option>
        <option value="PROCESSING">Processing</option>
        <option value="READY">Ready for pickup</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Reference</th><th>Customer</th><th>Status</th><th>Payment</th><th class="num">Total</th><th>Placed</th></tr></thead>
        <tbody>
          <tr *ngFor="let o of orders()">
            <td><a [routerLink]="['/admin/orders', o.orderReference]" style="color:var(--ez-primary-strong);font-weight:600">{{ o.orderReference }}</a></td>
            <td>{{ o.customerName }}<div class="muted" style="font-size:0.78rem">{{ o.customerEmail }}</div></td>
            <td><span class="badge badge-muted">{{ o.status }}</span></td>
            <td><span class="badge" [class.badge-success]="o.paymentStatus==='COMPLETED'" [class.badge-warn]="o.paymentStatus!=='COMPLETED'">{{ o.paymentStatus }}</span></td>
            <td class="num">{{ o.total | currency:o.currency:'symbol-narrow' }}</td>
            <td>{{ o.createdAt | date:'d MMM y, h:mm a' }}</td>
          </tr>
          <tr *ngIf="loading()"><td colspan="6" class="admin-empty">Loading…</td></tr>
          <tr *ngIf="!loading() && !orders().length"><td colspan="6" class="admin-empty">No orders.</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class AdminOrdersComponent {
  private readonly api = inject(AdminApiService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  status = '';

  constructor() { this.load(''); }

  load(status: string) {
    this.loading.set(true);
    this.api.listOrders(status || undefined).subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load orders.'); this.loading.set(false); },
    });
  }
}
