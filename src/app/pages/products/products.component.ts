import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  private productService = inject(ProductService);

  products = this.productService.filteredProducts;
  categories = this.productService.uniqueCategories;
  activeCategory = this.productService.activeCategory;
  searchQuery = '';

  setCategory(cat: string): void {
    this.productService.setCategory(cat);
  }

  onSearch(query: string): void {
    this.productService.setSearch(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.productService.setSearch('');
  }
}
