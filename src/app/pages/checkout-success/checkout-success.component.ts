import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderRepository } from '../../repositories/order.repository';
import { SeoService } from '../../services/seo.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss',
})
export class CheckoutSuccessComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderRepository);
  private readonly seo = inject(SeoService);

  readonly ref = signal<string | null>(null);
  readonly order = signal<Order | undefined>(undefined);
  readonly loading = signal(true);

  private timer?: ReturnType<typeof setTimeout>;
  private attempts = 0;

  ngOnInit(): void {
    this.seo.update({ title: 'Order received', path: '/checkout/success' });
    const ref = this.route.snapshot.queryParamMap.get('ref');
    this.ref.set(ref);
    if (!ref) { this.loading.set(false); return; }
    this.poll(ref);
  }

  /**
   * The HitPay webhook is authoritative for PAID and usually lands within a few
   * seconds of the redirect. Poll the order until it's COMPLETED (or a sensible
   * cap), so the customer sees "Paid" without refreshing.
   */
  private poll(ref: string): void {
    this.orders.getByReference(ref).subscribe(o => {
      this.order.set(o);
      this.loading.set(false);
      this.attempts++;
      const settled = o?.paymentStatus === 'COMPLETED' || o?.paymentStatus === 'FAILED';
      if (!settled && this.attempts < 15) {
        this.timer = setTimeout(() => this.poll(ref), 3000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
