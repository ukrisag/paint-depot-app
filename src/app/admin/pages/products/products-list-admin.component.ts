import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProductService } from '../../services/admin-product.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
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
  products = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedCategoryId = signal<number | undefined>(undefined);
  selectedBrandId = signal<number | undefined>(undefined);
  selectedStatus = signal<boolean | undefined>(undefined);
  sortBy = signal<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('name-asc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Delete confirmation
  productToDelete = signal<ProductDto | undefined>(undefined);
  showDeleteConfirm = signal(false);

  constructor(
    private adminProductService: AdminProductService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  loadCategories(): void {
    this.adminProductService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories.filter(c => c.isActive));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadBrands(): void {
    this.adminProductService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands.filter(b => b.isActive));
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminProductService.getProducts(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery() || undefined,
      this.selectedCategoryId(),
      this.selectedBrandId(),
      this.selectedStatus()
    ).subscribe({
      next: (response) => {
        let products = response.products;

        // Sort products
        products = this.sortProducts(products);

        this.products.set(products);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลสินค้าได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  sortProducts(products: ProductDto[]): ProductDto[] {
    return [...products].sort((a, b) => {
      switch (this.sortBy()) {
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
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSortChange(): void {
    this.products.set(this.sortProducts(this.products()));
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
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
    this.productToDelete.set(product);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    if (!this.productToDelete()?.id) return;

    this.adminProductService.deleteProduct(this.productToDelete()!.id!).subscribe({
      next: () => {
        this.notificationService.success('ลบสินค้าเรียบร้อยแล้ว');
        this.showDeleteConfirm.set(false);
        this.productToDelete.set(undefined);
        this.loadProducts();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบสินค้าได้');
        console.error('Error deleting product:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.productToDelete.set(undefined);
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
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะสินค้าได้');
        console.error('Error toggling product status:', err);
      }
    });
  }

  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) return '-';
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || '-';
  }

  getBrandName(brandId: number | null | undefined): string {
    if (!brandId) return '-';
    const brand = this.brands().find(b => b.id === brandId);
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
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set(undefined);
    this.selectedBrandId.set(undefined);
    this.selectedStatus.set(undefined);
    this.sortBy.set('name-asc');
    this.currentPage.set(1);
    this.loadProducts();
  }

  // Report downloads
  downloadExcel(): void {
    this.reportService.downloadProductsExcel(this.selectedCategoryId(), this.selectedBrandId());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    this.reportService.downloadProductsPdf(this.selectedCategoryId(), this.selectedBrandId());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
