import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { SeoService } from '../../services/seo.service';
import { SETTINGS } from '../../config/business.config';
import { TERMS_VERSION, PRIVACY_VERSION } from '../../services/customer-identity.service';

type PolicyKey = 'terms' | 'privacy' | 'refund' | 'delivery';

interface PolicySection { heading: string; body: string[]; }

interface PolicyDoc {
  title: string;
  version: string;
  intro: string;
  sections: PolicySection[];
}

/**
 * Placeholder legal/policy pages. Content is DRAFT and must be reviewed by the
 * business/legal owner before go-live. Kept in one component; the version shown
 * here is tied to the acceptance versions recorded at cart identity capture.
 */
@Component({
  selector: 'app-policy',
  standalone: true,
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss',
})
export class PolicyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  private readonly biz = SETTINGS.legalName;

  private readonly docs: Record<PolicyKey, PolicyDoc> = {
    terms: {
      title: 'Terms & Conditions',
      version: TERMS_VERSION,
      intro: `These terms govern your use of ${this.biz}'s online store and your purchases.`,
      sections: [
        { heading: 'Orders', body: [`All orders are subject to acceptance and product availability. ${this.biz} may cancel an order and issue a full refund if an item is unavailable or a pricing error occurs.`] },
        { heading: 'Pricing & payment', body: ['Prices are shown in Singapore Dollars (SGD). The amount payable is calculated and confirmed by us at checkout. Payment is processed securely by our third-party payment provider; we do not store card details.'] },
        { heading: 'Warranty', body: ['Products are covered by the warranty stated on the product page. Warranty claims are handled per the manufacturer/EZONE warranty terms.'] },
        { heading: 'Liability', body: [`To the extent permitted by law, ${this.biz}'s liability is limited to the value of the affected order.`] },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      version: PRIVACY_VERSION,
      intro: `${this.biz} collects only the information needed to process your order and contact you about it.`,
      sections: [
        { heading: 'What we collect', body: ['Your name, email, mobile number, and — for delivery orders — your delivery address. We do not ask for NRIC, date of birth, or other unnecessary personal data.'] },
        { heading: 'How we use it', body: ['To fulfil your order, provide support, and send order-related updates. We do not sell your data. Marketing communication, if ever offered, is strictly opt-in via a separate consent.'] },
        { heading: 'Payment data', body: ['Card and payment details are handled by our payment provider. EZONE never stores card numbers or CVV.'] },
        { heading: 'Your choices', body: ['You may request access to or deletion of your personal data by contacting us.'] },
      ],
    },
    refund: {
      title: 'Refund Policy',
      version: TERMS_VERSION,
      intro: 'Draft refund terms — to be confirmed by the business owner.',
      sections: [
        { heading: 'Returns', body: ['Eligible items may be returned within the stated return window in original condition. Certain items may be non-returnable for hygiene or activation reasons.'] },
        { heading: 'Refunds', body: ['Approved refunds are issued to the original payment method via our payment provider. Processing timelines depend on the provider and your bank.'] },
      ],
    },
    delivery: {
      title: 'Delivery Policy',
      version: TERMS_VERSION,
      intro: 'Draft delivery terms — delivery fees and timelines are configurable and confirmed at checkout.',
      sections: [
        { heading: 'Delivery', body: ['We deliver islandwide across Singapore. Applicable delivery fees are shown at checkout based on current settings.'] },
        { heading: 'Store pickup', body: ['Where enabled, orders may be collected from our store once confirmed. Pickup details are shown at checkout and in your confirmation.'] },
      ],
    },
  };

  readonly doc = toSignal(
    this.route.data.pipe(
      map(data => {
        const key = (data['policy'] as PolicyKey) ?? 'terms';
        const doc = this.docs[key];
        this.seo.update({ title: doc.title, path: `/${data['path'] ?? key}`, description: doc.intro });
        return doc;
      })
    )
  );

  readonly updatedLabel = computed(() => this.doc()?.version ?? '');
}
