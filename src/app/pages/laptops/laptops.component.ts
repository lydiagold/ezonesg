import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-laptops',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './laptops.component.html',
  styleUrl: './laptops.component.scss'
})
export class LaptopsComponent {
  services = [
    {
      icon: '🛒',
      title: 'New Laptop Sales',
      desc: 'Wide range of business laptops from leading brands — Dell, Lenovo, HP, Apple, and more. Best-price guarantee.',
      cta: 'Enquire Now'
    },
    {
      icon: '🔄',
      title: 'Short & Long-Term Rentals',
      desc: 'Flexible rental plans for events, projects, and corporate needs. Daily, weekly, and monthly options available.',
      cta: 'Get a Quote'
    },
    {
      icon: '♻️',
      title: 'Refurbished Devices',
      desc: 'Certified pre-owned laptops and desktops at competitive prices. All tested, cleaned, and warrantied.',
      cta: 'Browse Stock'
    },
    {
      icon: '🏢',
      title: 'Corporate Deployment',
      desc: 'Bulk procurement, imaging, asset tagging, and delivery for offices, schools, and organisations across Singapore.',
      cta: 'Get a Proposal'
    },
    {
      icon: '🔧',
      title: 'IT Support & Repairs',
      desc: 'Hardware repairs, data recovery, OS reinstallation, virus removal, and onsite/remote IT support.',
      cta: 'Book Support'
    },
    {
      icon: '📦',
      title: 'Trade-In & Buyback',
      desc: 'Sell or trade in your old devices. Fair valuations and instant offers for business or personal equipment.',
      cta: 'Get Valuation'
    }
  ];

  brands = ['Dell', 'Lenovo', 'HP', 'Apple', 'Asus', 'Acer', 'Microsoft Surface', 'Samsung'];
}
