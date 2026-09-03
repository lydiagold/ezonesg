import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_LINKS, FOOTER_LINKS } from '../../config/nav.config';
import { SETTINGS, whatsappLink } from '../../config/business.config';

@Component({
  selector: 'app-ez-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ez-footer.component.html',
  styleUrl: './ez-footer.component.scss',
})
export class EzFooterComponent {
  readonly settings = SETTINGS;
  readonly whatsapp = whatsappLink();
  readonly shopLinks = NAV_LINKS;
  readonly companyLinks = FOOTER_LINKS;
  readonly policyLinks = [
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Delivery Policy', path: '/delivery-policy' },
    { label: 'Refund Policy', path: '/refund-policy' },
  ];
  readonly year = new Date().getFullYear();

  get hasContact(): boolean {
    return !!(this.settings.supportEmail || this.settings.supportPhone || this.whatsapp);
  }
}
