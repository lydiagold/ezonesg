import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ProductRepository } from './app/repositories/product.repository';
import { MockProductRepository } from './app/repositories/mock-product.repository';
import { OrderRepository } from './app/repositories/order.repository';
import { MockOrderRepository } from './app/repositories/mock-order.repository';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideAnimations(),

    // Phase 1 data layer: in-memory mock repositories backed by SEED data.
    // Phase 2/4 swap these bindings for HTTP implementations — components unchanged.
    { provide: ProductRepository, useClass: MockProductRepository },
    { provide: OrderRepository, useClass: MockOrderRepository },
  ],
}).catch(err => console.error(err));
