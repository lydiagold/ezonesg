import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../admin-api.service';

interface CustomerRow { email: string; name: string; mobile: string; orders: number; totalSpent: number; lastOrderAt: string; }

@Component({
  selector: 'ez-admin-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page-head"><div><h1>Customers</h1><p>Derived from orders — {{ rows().length }} customer(s)</p></div></div>
    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th class="num">Orders</th><th class="num">Spent</th><th>Last order</th></tr></thead>
        <tbody>
          <tr *ngFor="let c of rows()">
            <td style="font-weight:600">{{ c.name }}</td>
            <td>{{ c.email }}</td>
            <td>{{ c.mobile }}</td>
            <td class="num">{{ c.orders }}</td>
            <td class="num">{{ c.totalSpent | currency:'SGD':'symbol-narrow' }}</td>
            <td>{{ c.lastOrderAt | date:'d MMM y' }}</td>
          </tr>
          <tr *ngIf="loading()"><td colspan="6" class="admin-empty">Loading…</td></tr>
          <tr *ngIf="!loading() && !rows().length"><td colspan="6" class="admin-empty">No customers yet.</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class AdminCustomersComponent {
  private readonly api = inject(AdminApiService);
  readonly rows = signal<CustomerRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() {
    this.api.customers().subscribe({
      next: r => { this.rows.set(r); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load customers.'); this.loading.set(false); },
    });
  }
}
