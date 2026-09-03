import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-checkout-cancelled',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section">
      <div class="container narrow">
        <div class="card">
          <h1>Payment cancelled</h1>
          <p class="muted">Your payment wasn't completed and you haven't been charged. Your cart is still saved.</p>
          <div class="actions">
            <a class="btn btn-primary" routerLink="/checkout">Try again</a>
            <a class="btn btn-outline" routerLink="/cart">Back to cart</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .narrow { max-width: 560px; }
    .card { padding: 2.5rem; text-align: center; }
    .card h1 { margin-bottom: 0.5rem; }
    .card p { margin-bottom: 1.5rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
  `],
})
export class CheckoutCancelledComponent implements OnInit {
  private readonly seo = inject(SeoService);
  ngOnInit(): void {
    this.seo.update({ title: 'Payment cancelled', path: '/checkout/cancelled' });
  }
}
