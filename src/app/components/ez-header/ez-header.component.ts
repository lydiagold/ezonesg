import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-ez-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './ez-header.component.html',
  styleUrl: './ez-header.component.scss'
})
export class EzHeaderComponent {
  isMenuOpen = signal(false);
  isScrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 60);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
