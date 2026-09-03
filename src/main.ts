import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { ProductRepository } from './app/repositories/product.repository';
import { MockProductRepository } from './app/repositories/mock-product.repository';
import { HttpProductRepository } from './app/repositories/http-product.repository';
import { OrderRepository } from './app/repositories/order.repository';
import { MockOrderRepository } from './app/repositories/mock-order.repository';
import { HttpOrderRepository } from './app/repositories/http-order.repository';

// Data layer binding. `useMock` (SEED data, no backend) vs the HTTP repositories
// that call the Phase 2 API. Components depend only on the abstract repositories.
const productRepository = environment.useMock ? MockProductRepository : HttpProductRepository;
const orderRepository = environment.useMock ? MockOrderRepository : HttpOrderRepository;

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideAnimations(),
    provideHttpClient(withFetch()),

    { provide: ProductRepository, useClass: productRepository },
    { provide: OrderRepository, useClass: orderRepository },
  ],
}).catch(err => console.error(err));
