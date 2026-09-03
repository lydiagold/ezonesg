import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../admin-api.service';
import { ImageUploadComponent } from '../../components/image-upload.component';
import { Product } from '../../../models/product.model';

type Tab = 'hero' | 'cards' | 'featured' | 'banners' | 'why' | 'contact' | 'sections';

@Component({
  selector: 'ez-admin-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUploadComponent],
  template: `
    <div class="admin-page-head">
      <div><h1>Homepage</h1><p>Edit storefront content — no code deploy needed.</p></div>
      <div class="admin-row-actions">
        <a href="/" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Preview ↗</a>
        <button class="btn btn-primary btn-sm" (click)="save()" [disabled]="saving()">{{ saving() ? 'Publishing…' : 'Save & Publish' }}</button>
      </div>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <div class="admin-tabs">
      <button class="admin-tab" *ngFor="let t of tabs" [class.active]="tab() === t.key" (click)="tab.set(t.key)">{{ t.label }}</button>
    </div>

    <ng-container *ngIf="cfg() as c">
      <!-- HERO -->
      <div *ngIf="tab() === 'hero'" class="admin-panel">
        <div class="admin-panel__head">Hero section
          <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.hero.active" /><span class="track"></span> Active</label>
        </div>
        <div class="admin-panel__body admin-form-grid">
          <div class="field col-span-2"><label>Eyebrow</label><input class="input" [(ngModel)]="c.hero.eyebrow" /></div>
          <div class="field col-span-2"><label>Heading</label><input class="input" [(ngModel)]="c.hero.heading" /></div>
          <div class="field col-span-2"><label>Description</label><textarea class="textarea" rows="2" [(ngModel)]="c.hero.description"></textarea></div>
          <div class="field"><label>Primary button label</label><input class="input" [(ngModel)]="c.hero.primaryLabel" /></div>
          <div class="field"><label>Primary button URL</label><input class="input" [(ngModel)]="c.hero.primaryUrl" /></div>
          <div class="field"><label>Secondary button label</label><input class="input" [(ngModel)]="c.hero.secondaryLabel" /></div>
          <div class="field"><label>Secondary button URL</label><input class="input" [(ngModel)]="c.hero.secondaryUrl" /></div>
          <div class="field"><label>Desktop image</label><ez-image-upload folder="homepage" [value]="c.hero.desktopImageUrl" (keyChange)="c.hero.desktopImageKey = $event"></ez-image-upload></div>
          <div class="field"><label>Mobile image</label><ez-image-upload folder="homepage" [value]="c.hero.mobileImageUrl" (keyChange)="c.hero.mobileImageKey = $event"></ez-image-upload></div>
        </div>
      </div>

      <!-- CATEGORY CARDS -->
      <div *ngIf="tab() === 'cards'" class="admin-panel">
        <div class="admin-panel__head">Category cards
          <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.categoryCards.active" /><span class="track"></span> Active</label>
        </div>
        <div class="admin-panel__body">
          <div class="field"><label>Section heading</label><input class="input" [(ngModel)]="c.categoryCards.heading" /></div>
          <div *ngFor="let card of c.categoryCards.items; let i = index" style="border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);padding:0.8rem;margin-bottom:0.75rem">
            <div class="admin-form-grid">
              <div class="field"><label>Title</label><input class="input" [(ngModel)]="card.title" /></div>
              <div class="field"><label>Subtitle</label><input class="input" [(ngModel)]="card.subtitle" /></div>
              <div class="field"><label>Destination URL</label><input class="input" [(ngModel)]="card.url" /></div>
              <div class="field"><label>Display order</label><input class="input" type="number" [(ngModel)]="card.order" /></div>
              <div class="field"><label>Image</label><ez-image-upload folder="categories" [value]="card.imageUrl" (keyChange)="card.imageKey = $event"></ez-image-upload></div>
              <div class="field" style="padding-top:1.6rem"><label class="admin-switch"><input type="checkbox" [(ngModel)]="card.active" /><span class="track"></span> Active</label></div>
            </div>
          </div>
        </div>
      </div>

      <!-- FEATURED -->
      <div *ngIf="tab() === 'featured'" class="admin-panel">
        <div class="admin-panel__head">Featured products
          <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.featured.active" /><span class="track"></span> Active</label>
        </div>
        <div class="admin-panel__body">
          <div class="field"><label>Section heading</label><input class="input" [(ngModel)]="c.featured.heading" /></div>
          <div class="field"><label>Description</label><input class="input" [(ngModel)]="c.featured.description" /></div>
          <p class="muted" style="margin-bottom:0.75rem">Pick and order the products shown under “Featured”. If empty, products flagged <em>featured</em> are used.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem" class="admin-featured-grid">
            <div>
              <h4 style="font-size:0.8rem;text-transform:uppercase;color:var(--ez-text-muted);margin-bottom:0.5rem">Selected</h4>
              <div *ngFor="let id of c.featured.productIds; let i = index" style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem;border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);margin-bottom:0.35rem">
                <span style="flex:1">{{ nameFor(id) }}</span>
                <button class="btn btn-ghost btn-sm" (click)="move(i, -1)" [disabled]="i===0">↑</button>
                <button class="btn btn-ghost btn-sm" (click)="move(i, 1)" [disabled]="i===c.featured.productIds.length-1">↓</button>
                <button class="btn btn-ghost btn-sm" (click)="unfeature(id)">✕</button>
              </div>
              <p *ngIf="!c.featured.productIds.length" class="muted">None selected.</p>
            </div>
            <div>
              <h4 style="font-size:0.8rem;text-transform:uppercase;color:var(--ez-text-muted);margin-bottom:0.5rem">Available</h4>
              <div *ngFor="let p of available()" style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem;border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);margin-bottom:0.35rem">
                <span style="flex:1">{{ p.name }}</span>
                <button class="btn btn-outline btn-sm" (click)="feature(p.id)">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BANNERS -->
      <div *ngIf="tab() === 'banners'" class="admin-panel">
        <div class="admin-panel__head">Promotion banners
          <div style="display:flex;gap:0.75rem;align-items:center">
            <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.banners.active" /><span class="track"></span> Active</label>
            <button class="btn btn-outline btn-sm" (click)="addBanner()">+ Add banner</button>
          </div>
        </div>
        <div class="admin-panel__body">
          <div *ngFor="let b of c.banners.items; let i = index" style="border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);padding:0.8rem;margin-bottom:0.75rem">
            <div class="admin-form-grid">
              <div class="field"><label>Heading</label><input class="input" [(ngModel)]="b.heading" /></div>
              <div class="field"><label>Description</label><input class="input" [(ngModel)]="b.description" /></div>
              <div class="field"><label>CTA label</label><input class="input" [(ngModel)]="b.ctaLabel" /></div>
              <div class="field"><label>CTA link</label><input class="input" [(ngModel)]="b.ctaLink" /></div>
              <div class="field"><label>Display order</label><input class="input" type="number" [(ngModel)]="b.order" /></div>
              <div class="field" style="padding-top:1.6rem"><label class="admin-switch"><input type="checkbox" [(ngModel)]="b.active" /><span class="track"></span> Active</label></div>
              <div class="field"><label>Desktop image</label><ez-image-upload folder="banners" [value]="b.imageUrl" (keyChange)="b.imageKey = $event"></ez-image-upload></div>
              <div class="field"><label>Mobile image</label><ez-image-upload folder="banners" [value]="b.mobileImageUrl" (keyChange)="b.mobileImageKey = $event"></ez-image-upload></div>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="removeBanner(i)">Remove banner</button>
          </div>
          <p *ngIf="!c.banners.items.length" class="muted">No banners yet.</p>
        </div>
      </div>

      <!-- WHY SHOP -->
      <div *ngIf="tab() === 'why'" class="admin-panel">
        <div class="admin-panel__head">Why shop with EZONE
          <div style="display:flex;gap:0.75rem;align-items:center">
            <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.whyShop.active" /><span class="track"></span> Active</label>
            <button class="btn btn-outline btn-sm" (click)="addWhy()">+ Add card</button>
          </div>
        </div>
        <div class="admin-panel__body">
          <div class="field"><label>Section heading</label><input class="input" [(ngModel)]="c.whyShop.heading" /></div>
          <div *ngFor="let w of c.whyShop.items; let i = index" class="admin-form-grid" style="border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);padding:0.8rem;margin-bottom:0.75rem">
            <div class="field"><label>Title</label><input class="input" [(ngModel)]="w.title" /></div>
            <div class="field"><label>Icon id</label><input class="input" [(ngModel)]="w.icon" /></div>
            <div class="field col-span-2"><label>Description</label><input class="input" [(ngModel)]="w.description" /></div>
            <div class="field"><label>Order</label><input class="input" type="number" [(ngModel)]="w.order" /></div>
            <div class="field" style="display:flex;gap:1rem;align-items:center;padding-top:1.6rem">
              <label class="admin-switch"><input type="checkbox" [(ngModel)]="w.active" /><span class="track"></span> Active</label>
              <button class="btn btn-ghost btn-sm" (click)="removeWhy(i)">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTACT CTA -->
      <div *ngIf="tab() === 'contact'" class="admin-panel">
        <div class="admin-panel__head">Contact CTA
          <label class="admin-switch"><input type="checkbox" [(ngModel)]="c.contactCta.active" /><span class="track"></span> Active</label>
        </div>
        <div class="admin-panel__body admin-form-grid">
          <div class="field col-span-2"><label>Heading</label><input class="input" [(ngModel)]="c.contactCta.heading" /></div>
          <div class="field col-span-2"><label>Description</label><textarea class="textarea" rows="2" [(ngModel)]="c.contactCta.description"></textarea></div>
          <div class="field"><label class="admin-switch"><input type="checkbox" [(ngModel)]="c.contactCta.whatsappEnabled" /><span class="track"></span> WhatsApp CTA</label></div>
          <div class="field"><label class="admin-switch"><input type="checkbox" [(ngModel)]="c.contactCta.contactEnabled" /><span class="track"></span> Contact CTA</label></div>
          <p class="muted col-span-2" style="font-size:0.82rem">Contact details come from Business Settings.</p>
        </div>
      </div>

      <!-- SECTIONS ORDER -->
      <div *ngIf="tab() === 'sections'" class="admin-panel">
        <div class="admin-panel__head">Section order & visibility</div>
        <div class="admin-panel__body">
          <div *ngFor="let s of c.sections; let i = index" style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem;border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);margin-bottom:0.4rem">
            <span style="flex:1;font-weight:600;text-transform:capitalize">{{ s.key }}</span>
            <label class="admin-switch"><input type="checkbox" [(ngModel)]="s.active" /><span class="track"></span> Active</label>
            <button class="btn btn-ghost btn-sm" (click)="moveSection(i, -1)" [disabled]="i===0">↑</button>
            <button class="btn btn-ghost btn-sm" (click)="moveSection(i, 1)" [disabled]="i===c.sections.length-1">↓</button>
          </div>
        </div>
      </div>
    </ng-container>

    <div *ngIf="loading()" class="admin-empty">Loading…</div>
  `,
  styles: [`@media (max-width: 720px){ .admin-featured-grid { grid-template-columns: 1fr !important; } }`],
})
export class AdminHomepageComponent {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'hero', label: 'Hero' },
    { key: 'cards', label: 'Category Cards' },
    { key: 'featured', label: 'Featured' },
    { key: 'banners', label: 'Banners' },
    { key: 'why', label: 'Why Shop' },
    { key: 'contact', label: 'Contact CTA' },
    { key: 'sections', label: 'Sections' },
  ];
  readonly tab = signal<Tab>('hero');
  readonly cfg = signal<any>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal(''); readonly notice = signal('');

  constructor() {
    const t = this.route.snapshot.queryParamMap.get('tab') as Tab | null;
    if (t && this.tabs.some(x => x.key === t)) this.tab.set(t);

    this.api.getHomepage().subscribe({
      next: c => { this.cfg.set(c); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error || 'Failed to load homepage config.'); this.loading.set(false); },
    });
    this.api.listProducts().subscribe({ next: p => this.products.set(p), error: () => {} });
  }

  nameFor = (id: string) => this.products().find(p => p.id === id)?.name || id;
  available = () => this.products().filter(p => !this.cfg()?.featured?.productIds?.includes(p.id));

  feature(id: string) { this.cfg().featured.productIds = [...this.cfg().featured.productIds, id]; }
  unfeature(id: string) { this.cfg().featured.productIds = this.cfg().featured.productIds.filter((x: string) => x !== id); }
  move(i: number, dir: number) { this.swap(this.cfg().featured.productIds, i, i + dir); }
  moveSection(i: number, dir: number) {
    this.swap(this.cfg().sections, i, i + dir);
    this.cfg().sections.forEach((s: any, idx: number) => (s.order = idx + 1));
  }
  private swap(arr: any[], a: number, b: number) { if (b < 0 || b >= arr.length) return; [arr[a], arr[b]] = [arr[b], arr[a]]; }

  addBanner() { this.cfg().banners.items.push({ heading: '', description: '', ctaLabel: '', ctaLink: '', imageKey: '', mobileImageKey: '', order: this.cfg().banners.items.length + 1, active: true }); }
  removeBanner(i: number) { this.cfg().banners.items.splice(i, 1); }
  addWhy() { this.cfg().whyShop.items.push({ title: '', description: '', icon: '', order: this.cfg().whyShop.items.length + 1, active: true }); }
  removeWhy(i: number) { this.cfg().whyShop.items.splice(i, 1); }

  save() {
    this.saving.set(true); this.error.set(''); this.notice.set('');
    this.api.saveHomepage(this.cfg()).subscribe({
      next: () => { this.saving.set(false); this.notice.set('Homepage published.'); },
      error: e => { this.saving.set(false); this.error.set(e?.error?.error || 'Publish failed.'); },
    });
  }
}
