import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ez-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ez-footer.component.html',
  styleUrl: './ez-footer.component.scss'
})
export class EzFooterComponent {
  currentYear = new Date().getFullYear();
}
