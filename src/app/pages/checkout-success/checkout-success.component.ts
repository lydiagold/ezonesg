import { Component, inject, OnInit, signal } from '@angular/core';
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
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderRepository);
  private readonly seo = inject(SeoService);

  readonly ref = signal<string | null>(null);
  readonly order = signal<Order | undefined>(undefined);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.seo.update({ title: 'Order received', path: '/checkout/success' });
    const ref = this.route.snapshot.queryParamMap.get('ref');
    this.ref.set(ref);
    if (!ref) { this.loading.set(false); return; }

    // The webhook is authoritative for PAID. Here we query the order status;
    // in production this would poll until the webhook confirms payment.
    this.orders.getByReference(ref).subscribe(o => {
      this.order.set(o);
      this.loading.set(false);
    });
  }
}
