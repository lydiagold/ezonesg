import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-orchardroots-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './orchardroots-layout.component.html',
  styleUrl: './orchardroots-layout.component.scss'
})
export class OrchardRootsLayoutComponent {}
