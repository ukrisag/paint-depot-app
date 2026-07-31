import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product, Brand } from '../../models/product.model';
import { ProductCardComponent } from '../products/product-card/product-card';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ProductCardComponent, ImageFallbackDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);
  bestsellerProducts = signal<Product[]>([]);
  brands = signal<Brand[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    console.log('🔄 Loading home page data...');

    // Load all data in parallel
    forkJoin({
      featured: this.productService.getFeaturedProducts(8),
      bestsellers: this.productService.getBestsellerProducts(8),
      brands: this.productService.getBrands()
    }).subscribe({
      next: (data) => {
        console.log('✅ Home data loaded:', {
          featured: data.featured.length,
          bestsellers: data.bestsellers.length,
          brands: data.brands.length
        });
        console.log('Featured products:', data.featured);
        console.log('Bestseller products:', data.bestsellers);
        console.log('Brands:', data.brands);

        this.featuredProducts.set(data.featured);
        this.bestsellerProducts.set(data.bestsellers);
        this.brands.set(data.brands);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading home data:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
        this.loading.set(false);
      }
    });
  }
}
