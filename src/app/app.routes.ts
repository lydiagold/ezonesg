import { Routes } from '@angular/router';
import { EzoneLayoutComponent } from './layouts/ezone-layout/ezone-layout.component';
import { OrchardRootsLayoutComponent } from './layouts/orchardroots-layout/orchardroots-layout.component';

export const routes: Routes = [
  /* ===== Ezone SG Main Site ===== */
  {
    path: '',
    component: EzoneLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/ez-home/ez-home.component').then(m => m.EzHomeComponent)
      },
      {
        path: 'software',
        loadComponent: () =>
          import('./pages/software/software.component').then(m => m.SoftwareComponent)
      },
      {
        path: 'codify',
        loadComponent: () =>
          import('./pages/codify/codify.component').then(m => m.CodifyComponent)
      },
      {
        path: 'laptops',
        loadComponent: () =>
          import('./pages/laptops/laptops.component').then(m => m.LaptopsComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/ez-contact/ez-contact.component').then(m => m.EzContactComponent)
      }
    ]
  },

  /* ===== OrchardRoots Sub-Site ===== */
  {
    path: 'orchardroots',
    component: OrchardRootsLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'corporate-gifting',
        loadComponent: () =>
          import('./pages/corporate-gifting/corporate-gifting.component').then(
            m => m.CorporateGiftingComponent
          )
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./pages/privacy-policy/privacy-policy.component').then(
            m => m.PrivacyPolicyComponent
          )
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
