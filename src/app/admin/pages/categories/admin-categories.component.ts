import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../admin-api.service';

interface Category { slug: string; name: string; tagline?: string; route?: string; sort?: number; active?: boolean; imageKey?: string; }

@Component({
  selector: 'ez-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-head"><div><h1>Categories</h1><p>Storefront category definitions</p></div></div>
    <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
    <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

    <div class="admin-panel" style="margin-bottom:1.25rem">
      <div class="admin-panel__head">Existing categories</div>
      <div class="admin-table-wrap" style="border:none">
        <table class="admin-table">
          <thead><tr><th>Slug</th><th>Name</th><th>Tagline</th><th class="num">Sort</th><th>Active</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of rows()">
              <td>{{ c.slug }}</td>
              <td><input class="input" [(ngModel)]="c.name" /></td>
              <td><input class="input" [(ngModel)]="c.tagline" /></td>
              <td class="num"><input class="input" type="number" style="width:70px" [(ngModel)]="c.sort" /></td>
              <td><label class="admin-switch"><input type="checkbox" [(ngModel)]="c.active" /><span class="track"></span></label></td>
              <td class="admin-row-actions"><button class="btn btn-outline btn-sm" (click)="save(c)">Save</button></td>
            </tr>
            <tr *ngIf="!rows().length"><td colspan="6" class="admin-empty">No categories.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="admin-panel">
      <div class="admin-panel__head">Add category</div>
      <div class="admin-panel__body admin-form-grid">
        <div class="field"><label>Slug <span class="req">*</span></label><input class="input" [(ngModel)]="draft.slug" placeholder="e.g. wearables" /></div>
        <div class="field"><label>Name</label><input class="input" [(ngModel)]="draft.name" /></div>
        <div class="field col-span-2"><label>Tagline</label><input class="input" [(ngModel)]="draft.tagline" /></div>
        <div class="field"><label>Sort</label><input class="input" type="number" [(ngModel)]="draft.sort" /></div>
        <div class="field" style="padding-top:1.6rem"><button class="btn btn-primary" (click)="create()">Add category</button></div>
      </div>
    </div>
  `,
})
export class AdminCategoriesComponent {
  private readonly api = inject(AdminApiService);
  readonly rows = signal<Category[]>([]);
  readonly error = signal(''); readonly notice = signal('');
  draft: Category = { slug: '', name: '', tagline: '', sort: 0, active: true };

  constructor() { this.load(); }

  load() {
    this.api.listCategories().subscribe({
      next: r => this.rows.set(r),
      error: e => this.error.set(e?.error?.error || 'Failed to load categories.'),
    });
  }

  save(c: Category) {
    this.api.saveCategory(c.slug, c).subscribe({
      next: () => this.notice.set(`Saved ${c.slug}.`),
      error: e => this.error.set(e?.error?.error || 'Save failed.'),
    });
  }

  create() {
    if (!this.draft.slug.trim()) { this.error.set('Slug is required.'); return; }
    this.api.createCategory(this.draft).subscribe({
      next: () => { this.notice.set('Category added.'); this.draft = { slug: '', name: '', tagline: '', sort: 0, active: true }; this.load(); },
      error: e => this.error.set(e?.error?.error || 'Create failed.'),
    });
  }
}
