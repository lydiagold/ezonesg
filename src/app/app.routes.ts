import { Routes } from '@angular/router';
import { EzoneLayoutComponent } from './layouts/ezone-layout/ezone-layout.component';

/**
 * EZONE storefront routes. All public pages render inside the storefront layout
 * (header + footer). The /admin area (Phase 3) has its own layout and is lazy
 * loaded so its code never ships to storefront visitors.
 */
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: EzoneLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/ez-home/ez-home.component').then(m => m.EzHomeComponent),
      },
      {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
      },
      {
        path: 'shop/phones',
        data: { category: 'phones' },
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
      },
      {
        path: 'shop/tablets',
        data: { category: 'tablets' },
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
      },
      {
        path: 'shop/accessories',
        data: { category: 'accessories' },
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('./pages/product/product.component').then(m => m.ProductComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'checkout/success',
        loadComponent: () => import('./pages/checkout-success/checkout-success.component').then(m => m.CheckoutSuccessComponent),
      },
      {
        path: 'checkout/cancelled',
        loadComponent: () => import('./pages/checkout-cancelled/checkout-cancelled.component').then(m => m.CheckoutCancelledComponent),
      },
      {
        path: 'order/:orderReference',
        loadComponent: () => import('./pages/order/order.component').then(m => m.OrderComponent),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
      },
      {
        path: 'terms',
        data: { policy: 'terms', path: 'terms' },
        loadComponent: () => import('./pages/policy/policy.component').then(m => m.PolicyComponent),
      },
      {
        path: 'privacy',
        data: { policy: 'privacy', path: 'privacy' },
        loadComponent: () => import('./pages/policy/policy.component').then(m => m.PolicyComponent),
      },
      {
        path: 'refund-policy',
        data: { policy: 'refund', path: 'refund-policy' },
        loadComponent: () => import('./pages/policy/policy.component').then(m => m.PolicyComponent),
      },
      {
        path: 'delivery-policy',
        data: { policy: 'delivery', path: 'delivery-policy' },
        loadComponent: () => import('./pages/policy/policy.component').then(m => m.PolicyComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
