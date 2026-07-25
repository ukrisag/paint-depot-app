import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  bestsellerProducts: Product[] = [];
  brands: Brand[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
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

        this.featuredProducts = data.featured;
        this.bestsellerProducts = data.bestsellers;
        this.brands = data.brands;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading home data:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
