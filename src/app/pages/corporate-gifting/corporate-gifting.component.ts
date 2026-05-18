import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GIFT_OPTIONS, OCCASIONS, CORPORATE_BENEFITS } from '../../config/corporate.config';
import { WHATSAPP_LINK } from '../../config/contact.config';

@Component({
  selector: 'app-corporate-gifting',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './corporate-gifting.component.html',
  styleUrl: './corporate-gifting.component.scss'
})
export class CorporateGiftingComponent {
  giftOptions = GIFT_OPTIONS;
  occasions = OCCASIONS;
  benefits = CORPORATE_BENEFITS;

  openEnquiry(): void {
    const message = 'Hello OrchardRoots! I am interested in corporate gifting. Please share bulk order options and pricing.';
    window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
