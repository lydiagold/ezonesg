import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CustomerIdentityService } from '../../services/customer-identity.service';
import { NAV_LINKS } from '../../config/nav.config';
import { SETTINGS } from '../../config/business.config';

@Component({
  selector: 'app-ez-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './ez-header.component.html',
  styleUrl: './ez-header.component.scss',
})
export class EzHeaderComponent {
  private readonly router = inject(Router);
  readonly cart = inject(CartService);
  readonly identity = inject(CustomerIdentityService);

  readonly brand = SETTINGS.businessName;
  readonly links = NAV_LINKS;

  readonly menuOpen = signal(false);
  readonly searchOpen = signal(false);
  query = '';

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
    this.searchOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
  }

  submitSearch(): void {
    const q = this.query.trim();
    this.searchOpen.set(false);
    this.menuOpen.set(false);
    this.router.navigate(['/shop'], { queryParams: q ? { q } : {} });
  }

  /**
   * Account affordance. Full accounts arrive in Increment B (Cognito); for now
   * this opens the identity capture so guests can save/update their details.
   */
  openAccount(): void {
    this.menuOpen.set(false);
    this.identity.openPrompt();
  }
}
