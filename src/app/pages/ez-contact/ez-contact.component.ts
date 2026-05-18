import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ez-contact',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './ez-contact.component.html',
  styleUrl: './ez-contact.component.scss'
})
export class EzContactComponent {
  form = {
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  };

  submitted = signal(false);

  services = [
    'Enterprise Software Development',
    'Codify Capital Markets Platform',
    'JK Infotech — Laptops & Rentals',
    'General Enquiry'
  ];

  onSubmit(): void {
    const { name, email, company, service, message } = this.form;
    const subject = encodeURIComponent(`Ezone SG Enquiry — ${service || 'General'}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService: ${service}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:ezonesg@gmail.com?subject=${subject}&body=${body}`;
    this.submitted.set(true);
  }
}
