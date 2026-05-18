import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_QUICK_LINKS, FOOTER_CATEGORY_LINKS } from '../../config/nav.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  quickLinks = FOOTER_QUICK_LINKS;
  categories = FOOTER_CATEGORY_LINKS;
}
