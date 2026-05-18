import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CATEGORIES } from '../../config/products.config';
import { TRUST_POINTS } from '../../config/home.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private productService = inject(ProductService);

  featuredProducts = this.productService.featuredProducts;
  categories = CATEGORIES;
  trustPoints = TRUST_POINTS;

  onCategoryImageError(event: Event, categoryName: string): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://placehold.co/200x200/4A7C2F/FFF8F0?text=${encodeURIComponent(categoryName)}`;
  }
}
