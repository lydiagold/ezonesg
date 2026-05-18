import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONTACT_SUBJECTS, WHATSAPP_LINK, CONTACT_EMAIL } from '../../config/contact.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  form = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  submitted = signal(false);
  subjects = CONTACT_SUBJECTS;

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.message) return;

    const message = `Hello OrchardRoots!\n\nName: ${this.form.name}\nEmail: ${this.form.email}\nPhone: ${this.form.phone || 'Not provided'}\nSubject: ${this.form.subject || 'General Enquiry'}\n\nMessage:\n${this.form.message}`;
    window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`, '_blank');
    this.submitted.set(true);
  }

  openWhatsApp(): void {
    window.open(`${WHATSAPP_LINK}?text=Hello%20OrchardRoots!%20I%20would%20like%20to%20get%20in%20touch.`, '_blank');
  }

  sendEmail(): void {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Enquiry from OrchardRoots Website`;
  }
}
