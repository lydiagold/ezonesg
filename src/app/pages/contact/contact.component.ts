import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { SETTINGS, whatsappLink } from '../../config/business.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly settings = SETTINGS;
  readonly whatsapp = whatsappLink();

  get hasAnyChannel(): boolean {
    return !!(this.settings.supportEmail || this.settings.supportPhone || this.whatsapp || this.settings.address);
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Contact',
      path: '/contact',
      description: `Contact ${SETTINGS.businessName} for electronics support in Singapore.`,
    });
  }
}
