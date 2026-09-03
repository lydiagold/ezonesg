import { Routes } from '@angular/router';
import { adminGuard } from './auth/admin.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

/**
 * /admin routes. The login page is public; everything under the layout is behind
 * adminGuard (UX only — the backend JWT authorizer + MASTER_ADMIN check is
 * authoritative). Lazy-loaded so the admin bundle never ships to storefront users.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'homepage', loadComponent: () => import('./pages/homepage/admin-homepage.component').then(m => m.AdminHomepageComponent) },
      { path: 'products', loadComponent: () => import('./pages/products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'products/new', loadComponent: () => import('./pages/products/admin-product-edit.component').then(m => m.AdminProductEditComponent) },
      { path: 'products/:id', loadComponent: () => import('./pages/products/admin-product-edit.component').then(m => m.AdminProductEditComponent) },
      { path: 'categories', loadComponent: () => import('./pages/categories/admin-categories.component').then(m => m.AdminCategoriesComponent) },
      { path: 'inventory', loadComponent: () => import('./pages/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent) },
      { path: 'orders', loadComponent: () => import('./pages/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'orders/:ref', loadComponent: () => import('./pages/orders/admin-order-detail.component').then(m => m.AdminOrderDetailComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customers/admin-customers.component').then(m => m.AdminCustomersComponent) },
      { path: 'settings', redirectTo: 'settings/business', pathMatch: 'full' },
      { path: 'settings/:tab', loadComponent: () => import('./pages/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
    ],
  },
];
