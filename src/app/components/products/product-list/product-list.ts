import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product, ProductFilters, Category, Brand } from '../../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  loading = true;
  pageTitle = 'สินค้าทั้งหมด';

  selectedCategoryId?: number;
  selectedBrandId?: number;
  searchQuery?: string;

  private subscription?: Subscription;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : undefined;
      this.selectedBrandId = params['brandId'] ? +params['brandId'] : undefined;
      this.searchQuery = params['search'];
      this.loadProducts(params);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadFilters() {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.cdr.detectChanges();
    });

    this.productService.getBrands().subscribe(brands => {
      this.brands = brands;
      this.cdr.detectChanges();
    });
  }

  filterByCategory(categoryId?: number) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: categoryId || null,
        brandId: this.selectedBrandId || null,
        search: this.searchQuery || null
      }
    });
  }

  filterByBrand(brandId?: number) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategoryId || null,
        brandId: brandId || null,
        search: this.searchQuery || null
      }
    });
  }

  clearFilters() {
    this.router.navigate(['/products']);
  }

  loadProducts(params: any = {}) {
    this.loading = true;

    const filters: ProductFilters = {};

    if (params['search']) {
      filters.search = params['search'];
      this.pageTitle = `ผลการค้นหา: ${params['search']}`;
    } else if (params['categoryId']) {
      filters.categoryId = +params['categoryId'];
      this.pageTitle = 'สินค้าตามหมวดหมู่';
    } else if (params['brandId']) {
      filters.brandId = +params['brandId'];
      this.pageTitle = 'สินค้าตามแบรนด์';
    } else {
      this.pageTitle = 'สินค้าทั้งหมด';
    }

    this.productService.getProducts(filters).subscribe({
      next: (result) => {
        this.products = result.products;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
