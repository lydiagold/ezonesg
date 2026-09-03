import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartDraftService } from '../../services/cart-draft.service';
import { CustomerIdentityService } from '../../services/customer-identity.service';
import { SeoService } from '../../services/seo.service';
import { CartItem, lineTotal } from '../../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  readonly cart = inject(CartService);
  readonly cartDraft = inject(CartDraftService);
  readonly identity = inject(CustomerIdentityService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({ title: 'Your Cart', path: '/cart', description: 'Review your EZONE cart.' });
  }

  key(item: CartItem): string { return this.cart.keyOf(item); }
  line(item: CartItem): number { return lineTotal(item); }

  inc(item: CartItem): void { this.cart.setQuantity(this.key(item), item.quantity + 1); }
  dec(item: CartItem): void { this.cart.setQuantity(this.key(item), item.quantity - 1); }
  remove(item: CartItem): void { this.cart.remove(this.key(item)); }
}
