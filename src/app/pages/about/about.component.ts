import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SETTINGS } from '../../config/business.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly business = SETTINGS;

  ngOnInit(): void {
    this.seo.update({
      title: 'About',
      path: '/about',
      description: `About ${SETTINGS.businessName} — a Singapore electronics retailer for iPhones, tablets and accessories.`,
    });
  }
}
