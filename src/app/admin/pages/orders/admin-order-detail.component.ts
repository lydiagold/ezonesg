import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService } from '../../admin-api.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'ez-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page-head">
      <div>
        <h1>{{ ref }}</h1>
        <p><a routerLink="/admin/orders" class="muted">← Back to orders</a></p>
      </div>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <ng-container *ngIf="order() as o">
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;align-items:start" class="admin-order-grid">
        <div class="admin-panel">
          <div class="admin-panel__head">Items</div>
          <div class="admin-table-wrap" style="border:none">
            <table class="admin-table">
              <thead><tr><th>Product</th><th>SKU</th><th class="num">Unit</th><th class="num">Qty</th><th class="num">Total</th></tr></thead>
              <tbody>
                <tr *ngFor="let i of o.items">
                  <td>{{ i.productName }}<div class="muted" style="font-size:0.78rem">{{ i.variantDescription }}</div></td>
                  <td>{{ i.sku }}</td>
                  <td class="num">{{ i.unitPrice | currency:o.currency:'symbol-narrow' }}</td>
                  <td class="num">{{ i.quantity }}</td>
                  <td class="num">{{ i.lineTotal | currency:o.currency:'symbol-narrow' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr><td colspan="4" class="num">Subtotal</td><td class="num">{{ o.subtotal | currency:o.currency:'symbol-narrow' }}</td></tr>
                <tr><td colspan="4" class="num">Delivery</td><td class="num">{{ o.deliveryFee | currency:o.currency:'symbol-narrow' }}</td></tr>
                <tr><td colspan="4" class="num" style="font-weight:700">Total</td><td class="num" style="font-weight:700">{{ o.total | currency:o.currency:'symbol-narrow' }}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1.25rem">
          <div class="admin-panel">
            <div class="admin-panel__head">Fulfilment</div>
            <div class="admin-panel__body">
              <div style="margin-bottom:0.75rem">
                <span class="badge badge-muted" style="margin-right:0.4rem">{{ o.status }}</span>
                <span class="badge" [class.badge-success]="o.paymentStatus==='COMPLETED'" [class.badge-warn]="o.paymentStatus!=='COMPLETED'">Payment: {{ o.paymentStatus }}</span>
              </div>
              <p class="muted" style="font-size:0.82rem;margin-bottom:0.75rem">
                Payment status is provider-controlled and cannot be changed here.
              </p>
              <div class="field">
                <label>Advance fulfilment to</label>
                <select class="select" [(ngModel)]="nextStatus">
                  <option *ngFor="let s of transitions" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="field"><label>Note (optional)</label><input class="input" [(ngModel)]="note" /></div>
              <button class="btn btn-primary btn-block" (click)="updateStatus()" [disabled]="saving() || !nextStatus">Update status</button>
            </div>
          </div>

          <div class="admin-panel">
            <div class="admin-panel__head">Customer</div>
            <div class="admin-panel__body" style="font-size:0.9rem">
              <p><strong>{{ o.customerName }}</strong></p>
              <p class="muted">{{ o.customerEmail }}</p>
              <p class="muted">{{ o.customerMobile }}</p>
              <hr style="border:none;border-top:1px solid var(--ez-border);margin:0.75rem 0" />
              <p>{{ o.shippingAddress.line1 }}</p>
              <p *ngIf="o.shippingAddress.line2">{{ o.shippingAddress.line2 }}</p>
              <p>Singapore {{ o.shippingAddress.postalCode }}</p>
              <p *ngIf="o.shippingAddress.deliveryNotes" class="muted">Notes: {{ o.shippingAddress.deliveryNotes }}</p>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
    <div *ngIf="loading()" class="admin-empty">Loading…</div>
  `,
  styles: [`@media (max-width: 860px) { .admin-order-grid { grid-template-columns: 1fr !important; } }`],
})
export class AdminOrderDetailComponent {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly ref = this.route.snapshot.paramMap.get('ref') || '';
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal(''); readonly notice = signal('');

  readonly transitions: OrderStatus[] = ['PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  nextStatus: OrderStatus | '' = '';
  note = '';

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getOrder(this.ref).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load order.'); this.loading.set(false); },
    });
  }

  updateStatus() {
    if (!this.nextStatus) return;
    this.saving.set(true); this.error.set(''); this.notice.set('');
    this.api.updateOrderStatus(this.ref, this.nextStatus as OrderStatus, this.note).subscribe({
      next: o => { this.order.set(o); this.saving.set(false); this.notice.set('Order updated.'); this.note = ''; },
      error: e => { this.saving.set(false); this.error.set(e?.error?.error || 'Update failed.'); },
    });
  }
}
