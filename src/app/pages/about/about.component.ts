import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND_VALUES, BRAND_STATS } from '../../config/about.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  values = BRAND_VALUES;
  stats = BRAND_STATS;
}
