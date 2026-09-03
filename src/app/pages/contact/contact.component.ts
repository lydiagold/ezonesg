import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { BUSINESS } from '../../config/business.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly business = BUSINESS;

  ngOnInit(): void {
    this.seo.update({
      title: 'Contact',
      path: '/contact',
      description: `Contact ${BUSINESS.name} — WhatsApp, phone and email support for electronics in Singapore.`,
    });
  }
}
