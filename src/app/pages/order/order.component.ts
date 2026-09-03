import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderRepository } from '../../repositories/order.repository';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderRepository);
  private readonly seo = inject(SeoService);

  readonly loaded = signal(false);

  readonly order = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => {
        const ref = params.get('orderReference') ?? '';
        this.seo.update({ title: `Order ${ref}`, path: `/order/${ref}` });
        return this.orders.getByReference(ref);
      })
    ),
    { initialValue: undefined }
  );
}
