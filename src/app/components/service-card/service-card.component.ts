import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCardComponent {
  @Input() icon = '';
  @Input() badge = '';
  @Input() title = '';
  @Input() description = '';
  @Input() link = '/';
  @Input() ctaLabel = 'Learn More';
  @Input() features: string[] = [];
  @Input() accentColor = 'navy';
}
