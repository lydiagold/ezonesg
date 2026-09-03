import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../../admin-api.service';
import { ImageUploadComponent } from '../../components/image-upload.component';
import { Product, ProductImage, ProductVariant } from '../../../models/product.model';

interface AttrRow { key: string; value: string; }

@Component({
  selector: 'ez-admin-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageUploadComponent],
  template: `
    <div class="admin-page-head">
      <div>
        <h1>{{ isNew ? 'Add product' : 'Edit product' }}</h1>
        <p><a routerLink="/admin/products" class="muted">← Back to products</a></p>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-outline btn-sm" *ngIf="!isNew" (click)="archive()" [disabled]="saving()">Archive</button>
        <button class="btn btn-primary btn-sm" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save product' }}</button>
      </div>
    </div>

    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <ng-container *ngIf="p() as m">
      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">Basics</div>
        <div class="admin-panel__body admin-form-grid">
          <div class="field col-span-2"><label>Name <span class="req">*</span></label><input class="input" [(ngModel)]="m.name" /></div>
          <div class="field"><label>Brand</label><input class="input" [(ngModel)]="m.brand" /></div>
          <div class="field">
            <label>Category <span class="req">*</span></label>
            <select class="select" [(ngModel)]="m.category">
              <option value="phones">iPhones</option>
              <option value="tablets">Tablets</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div class="field"><label>SKU</label><input class="input" [(ngModel)]="m.sku" /></div>
          <div class="field"><label>Slug</label><input class="input" [(ngModel)]="m.slug" placeholder="auto from name" /></div>
          <div class="field col-span-2"><label>Short description</label><input class="input" [(ngModel)]="m.shortDescription" /></div>
          <div class="field col-span-2"><label>Description</label><textarea class="textarea" rows="4" [(ngModel)]="m.description"></textarea></div>
        </div>
      </div>

      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">Pricing & visibility</div>
        <div class="admin-panel__body admin-form-grid">
          <div class="field"><label>Price (SGD) <span class="req">*</span></label><input class="input" type="number" min="0" [(ngModel)]="m.price" /></div>
          <div class="field"><label>Original / RRP</label><input class="input" type="number" min="0" [(ngModel)]="m.originalPrice" /></div>
          <div class="field"><label>Sale price</label><input class="input" type="number" min="0" [(ngModel)]="m.salePrice" /></div>
          <div class="field" style="display:flex;gap:1.5rem;align-items:center;padding-top:1.5rem">
            <label class="admin-switch"><input type="checkbox" [(ngModel)]="m.featured" /><span class="track"></span> Featured</label>
            <label class="admin-switch"><input type="checkbox" [(ngModel)]="m.active" /><span class="track"></span> Active</label>
          </div>
        </div>
      </div>

      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">Images</div>
        <div class="admin-panel__body">
          <div style="display:flex;flex-wrap:wrap;gap:1rem">
            <div *ngFor="let img of m.images; let i = index" style="border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);padding:0.6rem">
              <img [src]="img.url" alt="" style="width:120px;height:90px;object-fit:contain;background:var(--ez-surface-muted);border-radius:6px" />
              <div style="display:flex;gap:0.35rem;margin-top:0.4rem;align-items:center">
                <label class="admin-switch" style="font-size:0.78rem"><input type="radio" name="primary" [checked]="img.primary" (change)="setPrimary(i)" /> Primary</label>
                <button class="btn btn-ghost btn-sm" (click)="removeImage(i)">✕</button>
              </div>
            </div>
            <div style="min-width:200px">
              <ez-image-upload folder="products" label="Product image" (uploaded)="addImage($event)"></ez-image-upload>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">Specifications
          <button class="btn btn-outline btn-sm" (click)="addAttr()">+ Add spec</button>
        </div>
        <div class="admin-panel__body">
          <div *ngFor="let a of attrs(); let i = index" style="display:flex;gap:0.6rem;margin-bottom:0.5rem">
            <input class="input" placeholder="e.g. Display" [(ngModel)]="a.key" style="flex:1" />
            <input class="input" placeholder="e.g. 6.1-inch OLED" [(ngModel)]="a.value" style="flex:2" />
            <button class="btn btn-ghost btn-sm" (click)="removeAttr(i)">✕</button>
          </div>
          <p *ngIf="!attrs().length" class="muted">No specifications.</p>
        </div>
      </div>

      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">Variants
          <button class="btn btn-outline btn-sm" (click)="addVariant()">+ Add variant</button>
        </div>
        <div class="admin-panel__body">
          <div class="admin-alert err" *ngIf="!m.variants.length">At least one variant is required. Add one (a simple product has a single variant).</div>
          <div *ngFor="let v of m.variants; let i = index" style="border:1px solid var(--ez-border);border-radius:var(--ez-radius-sm);padding:0.8rem;margin-bottom:0.75rem">
            <div class="admin-form-grid">
              <div class="field"><label>SKU <span class="req">*</span></label><input class="input" [(ngModel)]="v.sku" /></div>
              <div class="field"><label>Stock</label><input class="input" type="number" min="0" [(ngModel)]="v.stockQuantity" /></div>
              <div class="field"><label>Price override</label><input class="input" type="number" min="0" [(ngModel)]="v.priceOverride" placeholder="uses product price" /></div>
              <div class="field"><label>Low-stock threshold</label><input class="input" type="number" min="0" [(ngModel)]="v.lowStockThreshold" /></div>
              <div class="field col-span-2"><label>Options (e.g. Storage=256GB, Colour=Black)</label><input class="input" [ngModel]="variantAttrString(v)" (ngModelChange)="setVariantAttrs(v, $event)" /></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <label class="admin-switch"><input type="checkbox" [(ngModel)]="v.active" /><span class="track"></span> Active</label>
              <button class="btn btn-ghost btn-sm" (click)="removeVariant(i)">Remove variant</button>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel" style="margin-bottom:1.25rem">
        <div class="admin-panel__head">SEO</div>
        <div class="admin-panel__body admin-form-grid">
          <div class="field col-span-2"><label>SEO title</label><input class="input" [(ngModel)]="m.seoTitle" /></div>
          <div class="field col-span-2"><label>SEO description</label><textarea class="textarea" rows="2" [(ngModel)]="m.seoDescription"></textarea></div>
        </div>
      </div>

      <div class="admin-row-actions" style="justify-content:flex-start">
        <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save product' }}</button>
        <a routerLink="/admin/products" class="btn btn-outline">Cancel</a>
      </div>
    </ng-container>
  `,
})
export class AdminProductEditComponent {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isNew = false;
  readonly p = signal<(Product & { seoTitle?: string; seoDescription?: string }) | null>(null);
  readonly attrs = signal<AttrRow[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew = true;
      this.p.set(this.blank());
    } else {
      this.api.getProduct(id).subscribe({
        next: prod => { this.p.set({ ...this.blank(), ...prod }); this.attrs.set(this.toRows(prod.attributes)); },
        error: e => this.error.set(e?.error?.error || 'Failed to load product.'),
      });
    }
  }

  private blank(): Product & { seoTitle?: string; seoDescription?: string } {
    return {
      id: '', slug: '', sku: '', name: '', brand: '', category: 'phones',
      description: '', shortDescription: '', price: 0, currency: 'SGD',
      images: [], attributes: {}, variants: [], featured: false, active: true,
      createdAt: '', updatedAt: '', seoTitle: '', seoDescription: '',
    };
  }

  private toRows(attrs: Record<string, string> = {}): AttrRow[] {
    return Object.entries(attrs).map(([key, value]) => ({ key, value }));
  }

  // --- attributes ---
  addAttr() { this.attrs.update(a => [...a, { key: '', value: '' }]); }
  removeAttr(i: number) { this.attrs.update(a => a.filter((_, idx) => idx !== i)); }

  // --- images ---
  addImage(result: { key: string; previewUrl: string }) {
    if (!result?.key) return;
    const m = this.p()!;
    const img: ProductImage = { key: result.key, url: result.previewUrl, alt: m.name, primary: m.images.length === 0, sort: m.images.length };
    m.images = [...m.images, img];
  }
  setPrimary(i: number) { const m = this.p()!; m.images = m.images.map((img, idx) => ({ ...img, primary: idx === i })); }
  removeImage(i: number) { const m = this.p()!; m.images = m.images.filter((_, idx) => idx !== i); }

  // --- variants ---
  addVariant() {
    const m = this.p()!;
    const v: ProductVariant & { lowStockThreshold?: number } = { id: '', sku: '', attributes: {}, stockQuantity: 0, active: true, lowStockThreshold: 3 };
    m.variants = [...m.variants, v];
  }
  removeVariant(i: number) { const m = this.p()!; m.variants = m.variants.filter((_, idx) => idx !== i); }
  variantAttrString(v: ProductVariant) { return Object.entries(v.attributes || {}).map(([k, val]) => `${k}=${val}`).join(', '); }
  setVariantAttrs(v: ProductVariant, str: string) {
    const attrs: Record<string, string> = {};
    for (const pair of str.split(',')) {
      const [k, ...rest] = pair.split('=');
      if (k?.trim() && rest.length) attrs[k.trim()] = rest.join('=').trim();
    }
    v.attributes = attrs;
  }

  async save() {
    const m = this.p()!;
    if (!m.name?.trim()) { this.error.set('Name is required.'); return; }
    if (!m.variants.length) { this.error.set('Add at least one variant.'); return; }
    m.attributes = Object.fromEntries(this.attrs().filter(a => a.key.trim()).map(a => [a.key.trim(), a.value]));

    this.saving.set(true); this.error.set(''); this.notice.set('');
    const req = this.isNew ? this.api.createProduct(m) : this.api.updateProduct(m.id, m);
    req.subscribe({
      next: saved => {
        this.saving.set(false);
        this.notice.set('Saved.');
        if (this.isNew) this.router.navigate(['/admin/products', saved.id]);
      },
      error: e => { this.saving.set(false); this.error.set(e?.error?.error || 'Save failed.'); },
    });
  }

  archive() {
    const m = this.p()!;
    if (!confirm(`Archive "${m.name}"? It will be hidden from the store but kept for order history.`)) return;
    this.api.archiveProduct(m.id).subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: e => this.error.set(e?.error?.error || 'Archive failed.'),
    });
  }
}
