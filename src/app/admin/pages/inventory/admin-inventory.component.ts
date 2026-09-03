import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, InventoryRow } from '../../admin-api.service';

@Component({
  selector: 'ez-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-head"><div><h1>Inventory</h1><p>Stock across every variant. Low-stock rows are highlighted.</p></div></div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <div class="admin-toolbar">
      <input class="input" placeholder="Search SKU or product…" [(ngModel)]="query" (ngModelChange)="q.set($event)" />
      <label class="admin-switch"><input type="checkbox" [(ngModel)]="lowOnly" (ngModelChange)="low.set($event)" /><span class="track"></span> Low stock only</label>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>SKU</th><th>Product</th><th>Variant</th><th class="num">Available</th><th>Status</th><th style="width:280px">Adjust</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of filtered()" [style.background]="r.lowStock ? 'var(--ez-warn-soft)' : ''">
            <td style="font-weight:600">{{ r.sku }}</td>
            <td>{{ r.productName }}</td>
            <td class="muted">{{ describe(r) }}</td>
            <td class="num">{{ r.availableQuantity }}</td>
            <td>
              <span class="badge" [class.badge-warn]="r.lowStock" [class.badge-success]="!r.lowStock">{{ r.lowStock ? 'Low' : 'OK' }}</span>
            </td>
            <td>
              <div style="display:flex;gap:0.4rem;align-items:center">
                <input class="input" type="number" style="width:90px" [(ngModel)]="draft[r.variantId]" [placeholder]="r.availableQuantity" />
                <input class="input" style="flex:1;min-width:80px" placeholder="Reason" [(ngModel)]="reason[r.variantId]" />
                <button class="btn btn-outline btn-sm" (click)="apply(r)" [disabled]="busyId() === r.variantId">Set</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="loading()"><td colspan="6" class="admin-empty">Loading…</td></tr>
          <tr *ngIf="!loading() && !filtered().length"><td colspan="6" class="admin-empty">No matching stock.</td></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class AdminInventoryComponent {
  private readonly api = inject(AdminApiService);
  readonly rows = signal<InventoryRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(''); readonly notice = signal('');
  readonly busyId = signal<string>('');

  draft: Record<string, number | null> = {};
  reason: Record<string, string> = {};

  query = ''; lowOnly = false;
  readonly q = signal(''); readonly low = signal(false);

  readonly filtered = computed(() => {
    const q = this.q().toLowerCase().trim();
    return this.rows().filter(r => {
      if (this.low() && !r.lowStock) return false;
      if (!q) return true;
      return `${r.sku} ${r.productName}`.toLowerCase().includes(q);
    });
  });

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.inventory().subscribe({
      next: r => { this.rows.set(r); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load inventory.'); this.loading.set(false); },
    });
  }

  describe = (r: InventoryRow) => Object.entries(r.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || '—';

  apply(r: InventoryRow) {
    const next = this.draft[r.variantId];
    if (next == null || Number(next) < 0) { this.error.set('Enter a valid quantity.'); return; }
    this.busyId.set(r.variantId); this.error.set(''); this.notice.set('');
    this.api.adjustInventory({ productId: r.productId, variantId: r.variantId, newQuantity: Number(next), reason: this.reason[r.variantId] }).subscribe({
      next: () => { this.busyId.set(''); this.notice.set(`Updated ${r.sku}.`); this.draft[r.variantId] = null; this.reason[r.variantId] = ''; this.load(); },
      error: e => { this.busyId.set(''); this.error.set(e?.error?.error || 'Adjustment failed.'); },
    });
  }
}
