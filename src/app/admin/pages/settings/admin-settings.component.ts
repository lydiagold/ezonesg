import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService, PaymentSettings } from '../../admin-api.service';

type Tab = 'business' | 'delivery' | 'payments' | 'policies';

@Component({
  selector: 'ez-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page-head"><div><h1>Settings</h1><p>Business, delivery, payments and policies</p></div></div>

    <div class="admin-tabs">
      <a class="admin-tab" routerLink="/admin/settings/business" [class.active]="tab==='business'">Business</a>
      <a class="admin-tab" routerLink="/admin/settings/delivery" [class.active]="tab==='delivery'">Delivery & Pickup</a>
      <a class="admin-tab" routerLink="/admin/settings/payments" [class.active]="tab==='payments'">Payments</a>
      <a class="admin-tab" routerLink="/admin/settings/policies" [class.active]="tab==='policies'">Policies</a>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <!-- BUSINESS -->
    <div *ngIf="tab==='business' && business() as b" class="admin-panel">
      <div class="admin-panel__head">Business information</div>
      <div class="admin-panel__body admin-form-grid">
        <div class="field"><label>Display name</label><input class="input" [(ngModel)]="b.displayName" /></div>
        <div class="field"><label>Legal company name</label><input class="input" [(ngModel)]="b.legalName" /></div>
        <div class="field"><label>Support email</label><input class="input" [(ngModel)]="b.supportEmail" /></div>
        <div class="field"><label>Support mobile</label><input class="input" [(ngModel)]="b.supportMobile" /></div>
        <div class="field"><label>WhatsApp number</label><input class="input" [(ngModel)]="b.whatsappNumber" /></div>
        <div class="field"><label>Business hours</label><input class="input" [(ngModel)]="b.businessHours" /></div>
        <div class="field col-span-2"><label>Store address</label><input class="input" [(ngModel)]="b.storeAddress" /></div>
        <div class="field"><label class="admin-switch"><input type="checkbox" [(ngModel)]="b.gstRegistered" /><span class="track"></span> GST registered</label></div>
        <div class="field"><label>GST registration no.</label><input class="input" [(ngModel)]="b.gstNumber" [disabled]="!b.gstRegistered" /></div>
        <div class="field col-span-2"><button class="btn btn-primary" (click)="saveBusiness(b)" [disabled]="saving()">Save business settings</button></div>
      </div>
    </div>

    <!-- DELIVERY -->
    <div *ngIf="tab==='delivery' && delivery() as d" class="admin-panel">
      <div class="admin-panel__head">Delivery & pickup</div>
      <div class="admin-panel__body admin-form-grid">
        <div class="field"><label>Standard delivery fee (SGD)</label><input class="input" type="number" min="0" [(ngModel)]="d.standardDeliveryFee" /></div>
        <div class="field"><label>Free delivery threshold (SGD)</label><input class="input" type="number" min="0" [(ngModel)]="d.freeDeliveryThreshold" /></div>
        <div class="field"><label class="admin-switch"><input type="checkbox" [(ngModel)]="d.deliveryEnabled" /><span class="track"></span> Delivery enabled</label></div>
        <div class="field"><label class="admin-switch"><input type="checkbox" [(ngModel)]="d.pickupEnabled" /><span class="track"></span> Pickup enabled</label></div>
        <div class="field col-span-2"><label>Pickup address</label><input class="input" [(ngModel)]="d.pickupAddress" /></div>
        <div class="field col-span-2"><label>Pickup instructions</label><textarea class="textarea" rows="2" [(ngModel)]="d.pickupInstructions"></textarea></div>
        <div class="field col-span-2"><button class="btn btn-primary" (click)="saveDelivery(d)" [disabled]="saving()">Save delivery settings</button></div>
      </div>
    </div>

    <!-- PAYMENTS -->
    <div *ngIf="tab==='payments' && payments() as p" class="admin-panel">
      <div class="admin-panel__head">HitPay configuration</div>
      <div class="admin-panel__body">
        <div class="admin-form-grid">
          <div class="field"><label>Provider</label><input class="input" [value]="p.provider" disabled /></div>
          <div class="field"><label>Environment</label><input class="input" [value]="p.environment" disabled /></div>
          <div class="field"><label>API key</label><input class="input" [value]="p.apiKey" disabled /></div>
          <div class="field"><label>Webhook salt</label><input class="input" [value]="p.webhookSalt" disabled /></div>
          <div class="field col-span-2"><label>Webhook URL</label><input class="input" [value]="p.webhookUrl" disabled /></div>
          <div class="field col-span-2"><label>Return URL</label><input class="input" [value]="p.returnUrl" disabled /></div>
        </div>
        <hr style="border:none;border-top:1px solid var(--ez-border);margin:1rem 0" />
        <p class="muted" style="margin-bottom:0.75rem">Update credentials (stored encrypted in AWS Secrets Manager — never shown again). Use <strong>sandbox</strong> keys until go-live.</p>
        <div class="admin-form-grid">
          <div class="field"><label>New API key</label><input class="input" type="password" [(ngModel)]="newApiKey" autocomplete="off" placeholder="leave blank to keep" /></div>
          <div class="field"><label>New webhook salt</label><input class="input" type="password" [(ngModel)]="newSalt" autocomplete="off" placeholder="leave blank to keep" /></div>
          <div class="field col-span-2"><button class="btn btn-primary" (click)="savePayments()" [disabled]="saving() || (!newApiKey && !newSalt)">Save credentials</button></div>
        </div>
      </div>
    </div>

    <!-- POLICIES -->
    <div *ngIf="tab==='policies' && business() as b" class="admin-panel">
      <div class="admin-panel__head">Store policies</div>
      <div class="admin-panel__body admin-form-grid">
        <div class="field col-span-2"><label>Return policy</label><textarea class="textarea" rows="3" [(ngModel)]="b.returnPolicy"></textarea></div>
        <div class="field col-span-2"><label>Warranty policy</label><textarea class="textarea" rows="3" [(ngModel)]="b.warrantyPolicy"></textarea></div>
        <div class="field col-span-2"><label>Delivery policy</label><textarea class="textarea" rows="3" [(ngModel)]="b.deliveryPolicy"></textarea></div>
        <div class="field col-span-2"><label>Privacy note</label><textarea class="textarea" rows="3" [(ngModel)]="b.privacyNote"></textarea></div>
        <div class="field col-span-2"><button class="btn btn-primary" (click)="saveBusiness(b)" [disabled]="saving()">Save policies</button></div>
      </div>
    </div>

    <div *ngIf="loading()" class="admin-empty">Loading…</div>
  `,
})
export class AdminSettingsComponent {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  tab: Tab = 'business';
  readonly business = signal<any>(null);
  readonly delivery = signal<any>(null);
  readonly payments = signal<PaymentSettings | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal(''); readonly notice = signal('');
  newApiKey = ''; newSalt = '';

  constructor() {
    this.route.paramMap.subscribe(pm => {
      const t = (pm.get('tab') as Tab) || 'business';
      this.tab = ['business', 'delivery', 'payments', 'policies'].includes(t) ? t : 'business';
      this.error.set(''); this.notice.set('');
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    const done = () => this.loading.set(false);
    if (this.tab === 'business' || this.tab === 'policies') {
      if (this.business()) { done(); return; }
      this.api.getBusiness().subscribe({ next: b => { this.business.set(b); done(); }, error: e => this.fail(e) });
    } else if (this.tab === 'delivery') {
      this.api.getDelivery().subscribe({ next: d => { this.delivery.set(d); done(); }, error: e => this.fail(e) });
    } else {
      this.api.getPayments().subscribe({ next: p => { this.payments.set(p); done(); }, error: e => this.fail(e) });
    }
  }

  saveBusiness(b: any) { this.run(this.api.saveBusiness(b), 'Saved.'); }
  saveDelivery(d: any) { this.run(this.api.saveDelivery(d), 'Saved.'); }
  savePayments() {
    this.run(this.api.savePayments({ apiKey: this.newApiKey || undefined, webhookSalt: this.newSalt || undefined }), 'Credentials updated.', () => {
      this.newApiKey = ''; this.newSalt = '';
      this.api.getPayments().subscribe({ next: p => this.payments.set(p) });
    });
  }

  private run(obs: any, ok: string, after?: () => void) {
    this.saving.set(true); this.error.set(''); this.notice.set('');
    obs.subscribe({
      next: () => { this.saving.set(false); this.notice.set(ok); after?.(); },
      error: (e: any) => { this.saving.set(false); this.error.set(e?.error?.error || 'Save failed.'); },
    });
  }
  private fail(e: any) { this.error.set(e?.error?.error || 'Failed to load settings.'); this.loading.set(false); }
}
