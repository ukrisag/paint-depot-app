import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product, ProductFilters, Category, Brand } from '../../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit, OnDestroy {
  products = signal<Product[]>([]);
  allProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  loading = signal(true);
  pageTitle = signal('สินค้าทั้งหมด');

  selectedCategoryId?: number;
  selectedBrandId?: number;
  searchQuery?: string;
  sortBy = signal('newest');

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 12;
  totalPages = signal(1);

  private subscription?: Subscription;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : undefined;
      this.selectedBrandId = params['brandId'] ? +params['brandId'] : undefined;
      this.searchQuery = params['search'];
      this.currentPage.set(params['page'] ? +params['page'] : 1);
      this.loadProducts(params);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadFilters() {
    this.productService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });

    this.productService.getBrands().subscribe(brands => {
      this.brands.set(brands);
    });
  }

  filterByCategory(categoryId?: number) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: categoryId || null,
        brandId: this.selectedBrandId || null,
        search: this.searchQuery || null,
        page: 1
      }
    });
  }

  filterByBrand(brandId?: number) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategoryId || null,
        brandId: brandId || null,
        search: this.searchQuery || null,
        page: 1
      }
    });
  }

  clearFilters() {
    this.router.navigate(['/products']);
  }

  clearCategoryFilter() {
    this.filterByCategory();
  }

  clearBrandFilter() {
    this.filterByBrand();
  }

  clearSearch() {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategoryId || null,
        brandId: this.selectedBrandId || null,
        page: 1
      }
    });
  }

  onSortChange() {
    this.sortProducts();
    this.updatePagination();
  }

  sortProducts() {
    const sorted = [...this.allProducts()];

    switch (this.sortBy()) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'th'));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
      default:
        // Keep original order (newest first, assuming API returns newest first)
        break;
    }

    this.allProducts.set(sorted);
  }

  loadProducts(params: any = {}) {
    this.loading.set(true);

    const filters: ProductFilters = {};

    if (params['search']) {
      filters.search = params['search'];
      this.pageTitle.set(`ผลการค้นหา: ${params['search']}`);
    } else if (params['categoryId']) {
      filters.categoryId = +params['categoryId'];
      const category = this.categories().find(c => c.id === +params['categoryId']);
      this.pageTitle.set(category ? category.name : 'สินค้าตามหมวดหมู่');
    } else if (params['brandId']) {
      filters.brandId = +params['brandId'];
      const brand = this.brands().find(b => b.id === +params['brandId']);
      this.pageTitle.set(brand ? brand.name : 'สินค้าตามแบรนด์');
    } else {
      this.pageTitle.set('สินค้าทั้งหมด');
    }

    this.productService.getProducts(filters).subscribe({
      next: (result) => {
        this.allProducts.set(result.products);
        this.sortProducts();
        this.updatePagination();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.allProducts.set([]);
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }

  updatePagination() {
    this.totalPages.set(Math.ceil(this.allProducts().length / this.itemsPerPage));
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.products.set(this.allProducts().slice(startIndex, endIndex));
  }

  goToPage(page: number | string) {
    if (typeof page === 'string') return;

    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePagination();

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update URL
      this.router.navigate(['/products'], {
        queryParams: {
          categoryId: this.selectedCategoryId || null,
          brandId: this.selectedBrandId || null,
          search: this.searchQuery || null,
          page: page > 1 ? page : null
        }
      });
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  }

  getTotalProductsText(): string {
    const count = this.allProducts().length;
    return `${count.toLocaleString('th-TH')} รายการ`;
  }

  getSelectedCategoryName(): string | undefined {
    return this.categories().find(c => c.id === this.selectedCategoryId)?.name;
  }

  getSelectedBrandName(): string | undefined {
    return this.brands().find(b => b.id === this.selectedBrandId)?.name;
  }
}
