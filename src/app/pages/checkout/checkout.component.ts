import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderRepository } from '../../repositories/order.repository';
import { SeoService } from '../../services/seo.service';
import { CheckoutRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(OrderRepository);
  private readonly router = inject(Router);
  readonly cart = inject(CartService);
  private readonly seo = inject(SeoService);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // SG mobile: 8 digits starting 8 or 9, optional +65 prefix. Postal: 6 digits.
  readonly form = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerMobile: ['', [Validators.required, Validators.pattern(/^(\+?65)?[\s-]?[89]\d{3}[\s-]?\d{4}$/)]],
    line1: ['', [Validators.required]],
    line2: [''],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    deliveryNotes: [''],
  });

  ngOnInit(): void {
    this.seo.update({ title: 'Checkout', path: '/checkout', description: 'Secure EZONE checkout.' });
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  pay(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.cart.isEmpty()) {
      this.error.set('Your cart is empty.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const request: CheckoutRequest = {
      customerName: v.customerName!,
      customerEmail: v.customerEmail!,
      customerMobile: v.customerMobile!,
      shippingAddress: {
        line1: v.line1!,
        line2: v.line2 || undefined,
        postalCode: v.postalCode!,
        deliveryNotes: v.deliveryNotes || undefined,
      },
      // Server recomputes authoritative pricing — we only send what to buy.
      items: this.cart.items().map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    this.orders.checkout(request).subscribe({
      next: res => {
        this.cart.clear();
        // External gateway URL in production; internal route for the Phase 1 mock.
        if (/^https?:\/\//.test(res.paymentUrl)) {
          window.location.href = res.paymentUrl;
        } else {
          this.router.navigateByUrl(res.paymentUrl);
        }
      },
      error: err => {
        this.submitting.set(false);
        this.error.set(err?.message ?? 'We could not start your payment. Please try again.');
      },
    });
  }
}
