import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CognitoAuthService } from '../auth/cognito-auth.service';

interface NavItem { label: string; path: string; queryParams?: Record<string, string>; exact?: boolean; }
interface NavGroup { title?: string; items: NavItem[]; }

/**
 * Admin shell: compact sidebar + topbar. All /admin/* pages render in the outlet.
 * Matches the EZONE brand (white, green accent) — deliberately not a giant-card
 * dashboard template.
 */
@Component({
  selector: 'ez-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin" [class.nav-open]="navOpen()">
      <div class="admin-scrim" *ngIf="navOpen()" (click)="navOpen.set(false)"></div>
      <div class="admin__shell">
        <aside class="admin-sidebar">
          <a routerLink="/" class="admin-sidebar__brand">
            <img src="assets/images/ezone-logo.png" alt="" /> EZONE Admin
          </a>
          <nav class="admin-sidebar__group" (click)="navOpen.set(false)">
            <ng-container *ngFor="let group of nav">
              <h4 *ngIf="group.title">{{ group.title }}</h4>
              <a *ngFor="let item of group.items"
                 class="admin-nav-link"
                 [routerLink]="item.path"
                 [queryParams]="item.queryParams || null"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: !!item.exact }">
                {{ item.label }}
              </a>
            </ng-container>
          </nav>
          <div class="admin-sidebar__foot">
            <button class="btn btn-ghost btn-block" (click)="logout()">Logout</button>
          </div>
        </aside>

        <div class="admin-main">
          <header class="admin-topbar">
            <button class="btn btn-ghost btn-sm admin-burger" (click)="navOpen.set(!navOpen())" aria-label="Menu">☰</button>
            <span class="admin-topbar__title">Storefront administration</span>
            <div class="admin-topbar__user">
              <span>{{ email() }}</span>
              <a routerLink="/" class="btn btn-outline btn-sm" target="_blank" rel="noopener">View store ↗</a>
            </div>
          </header>
          <main class="admin-content">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(CognitoAuthService);
  private readonly router = inject(Router);

  readonly navOpen = signal(false);
  readonly email = () => this.auth.identity()?.email || 'Administrator';

  readonly nav: NavGroup[] = [
    { items: [{ label: 'Dashboard', path: '/admin', exact: true }] },
    { title: 'Storefront', items: [
      { label: 'Homepage', path: '/admin/homepage' },
      { label: 'Banners', path: '/admin/homepage', queryParams: { tab: 'banners' } },
      { label: 'Featured Products', path: '/admin/homepage', queryParams: { tab: 'featured' } },
    ] },
    { title: 'Catalogue', items: [
      { label: 'Products', path: '/admin/products' },
      { label: 'Categories', path: '/admin/categories' },
      { label: 'Inventory', path: '/admin/inventory' },
    ] },
    { title: 'Orders', items: [
      { label: 'All Orders', path: '/admin/orders' },
      { label: 'Customers', path: '/admin/customers' },
    ] },
    { title: 'Settings', items: [
      { label: 'Business', path: '/admin/settings/business' },
      { label: 'Delivery & Pickup', path: '/admin/settings/delivery' },
      { label: 'Payments', path: '/admin/settings/payments' },
      { label: 'Policies', path: '/admin/settings/policies' },
    ] },
  ];

  logout() {
    this.auth.signOut();
    this.router.navigate(['/admin/login']);
  }
}
