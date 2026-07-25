import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProductService } from '../../services/admin-product.service';
import { NotificationService } from '../../../services/notification.service';
import { ProductDto } from '../../../services/openapi-client/model/productDto';
import { CategoryDto } from '../../../services/openapi-client/model/categoryDto';
import { BrandDto } from '../../../services/openapi-client/model/brandDto';

@Component({
  selector: 'app-products-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-list-admin.component.html',
  styleUrls: ['./products-list-admin.component.css']
})
export class ProductsListAdminComponent implements OnInit {
  products: ProductDto[] = [];
  categories: CategoryDto[] = [];
  brands: BrandDto[] = [];

  loading = true;
  error = '';

  // Filters
  searchQuery = '';
  selectedCategoryId?: number;
  selectedBrandId?: number;
  selectedStatus?: boolean;
  sortBy: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' = 'name-asc';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 1;

  // Delete confirmation
  productToDelete?: ProductDto;
  showDeleteConfirm = false;

  constructor(
    private adminProductService: AdminProductService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  loadCategories(): void {
    this.adminProductService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(c => c.isActive);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadBrands(): void {
    this.adminProductService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands.filter(b => b.isActive);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading brands:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.adminProductService.getProducts(
      this.currentPage,
      this.pageSize,
      this.searchQuery || undefined,
      this.selectedCategoryId,
      this.selectedBrandId,
      this.selectedStatus
    ).subscribe({
      next: (response) => {
        let products = response.products;

        // Sort products
        products = this.sortProducts(products);

        this.products = products;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลสินค้าได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading products:', err);
      }
    });
  }

  sortProducts(products: ProductDto[]): ProductDto[] {
    return [...products].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'price-desc':
          return (b.basePrice || 0) - (a.basePrice || 0);
        default:
          return 0;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.products = this.sortProducts(this.products);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  onAddNew(): void {
    this.router.navigate(['/admin/products/create']);
  }

  onEdit(productId: number | undefined): void {
    if (!productId) return;
    this.router.navigate(['/admin/products/edit', productId]);
  }

  onDeleteClick(product: ProductDto): void {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.productToDelete?.id) return;

    this.adminProductService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('ลบสินค้าเรียบร้อยแล้ว');
        this.showDeleteConfirm = false;
        this.productToDelete = undefined;
        this.loadProducts();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบสินค้าได้');
        console.error('Error deleting product:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.productToDelete = undefined;
  }

  onToggleStatus(product: ProductDto): void {
    if (!product.id) return;

    const newStatus = !product.isActive;
    this.adminProductService.toggleProductStatus(product.id, newStatus).subscribe({
      next: () => {
        product.isActive = newStatus;
        this.notificationService.success(
          newStatus ? 'เปิดใช้งานสินค้าแล้ว' : 'ปิดใช้งานสินค้าแล้ว'
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะสินค้าได้');
        console.error('Error toggling product status:', err);
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) return '-';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '-';
  }

  getBrandName(brandId: number | null | undefined): string {
    if (!brandId) return '-';
    const brand = this.brands.find(b => b.id === brandId);
    return brand?.name || '-';
  }

  getImageUrl(product: ProductDto): string {
    return product.primaryImage || '/assets/no-image.png';
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '฿0';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = undefined;
    this.selectedBrandId = undefined;
    this.selectedStatus = undefined;
    this.sortBy = 'name-asc';
    this.currentPage = 1;
    this.loadProducts();
  }
}
