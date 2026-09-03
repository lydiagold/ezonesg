import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EzHeaderComponent } from '../../components/ez-header/ez-header.component';
import { EzFooterComponent } from '../../components/ez-footer/ez-footer.component';
import { IdentityModalComponent } from '../../components/identity-modal/identity-modal.component';

@Component({
  selector: 'app-ezone-layout',
  standalone: true,
  imports: [RouterOutlet, EzHeaderComponent, EzFooterComponent, IdentityModalComponent],
  templateUrl: './ezone-layout.component.html',
  styleUrl: './ezone-layout.component.scss'
})
export class EzoneLayoutComponent {}
