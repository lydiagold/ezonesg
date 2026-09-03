import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_LINKS, FOOTER_LINKS } from '../../config/nav.config';
import { BUSINESS } from '../../config/business.config';

@Component({
  selector: 'app-ez-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ez-footer.component.html',
  styleUrl: './ez-footer.component.scss',
})
export class EzFooterComponent {
  readonly business = BUSINESS;
  readonly shopLinks = NAV_LINKS;
  readonly companyLinks = FOOTER_LINKS;
  readonly year = new Date().getFullYear();
}
