import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerIdentityService } from '../../services/customer-identity.service';

/**
 * "Save your cart" identity modal. Opens after a tentative add-to-cart when the
 * visitor has no valid identity yet. Collects contact details and *versioned*
 * terms/privacy acceptance. No dark patterns; no marketing opt-in here.
 *
 * Desktop: centered modal. Mobile: bottom sheet (CSS-driven).
 */
@Component({
  selector: 'app-identity-modal',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './identity-modal.component.html',
  styleUrl: './identity-modal.component.scss',
})
export class IdentityModalComponent {
  private readonly fb = inject(FormBuilder);
  readonly identity = inject(CustomerIdentityService);

  readonly showSignInNote = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    // SG mobile: 8 digits starting 8 or 9, optional +65 prefix.
    mobile: ['', [Validators.required, Validators.pattern(/^(\+?65)?[\s-]?[89]\d{3}[\s-]?\d{4}$/)]],
    accept: [false, [Validators.requiredTrue]],
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.identity.promptOpen()) this.close();
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  close(): void {
    this.identity.closePrompt();
  }

  continue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.identity.save({ name: v.name!, email: v.email!, mobile: v.mobile! });
    this.identity.closePrompt();
  }
}
