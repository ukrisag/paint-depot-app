import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminBrandService } from '../../services/admin-brand.service';
import { NotificationService } from '../../../services/notification.service';
import { BrandDto } from '../../../services/openapi-client/model/brandDto';
import { CreateBrandDto } from '../../../services/openapi-client/model/createBrandDto';
import { ImageFallbackDirective } from '../../../directives/image-fallback.directive';

@Component({
  selector: 'app-brand-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageFallbackDirective],
  templateUrl: './brand-list-admin.component.html',
  styleUrls: ['./brand-list-admin.component.css']
})
export class BrandListAdminComponent implements OnInit {
  brands: BrandDto[] = [];
  filteredBrands: BrandDto[] = [];

  loading = true;
  error = '';

  // Filters
  searchQuery = '';
  selectedStatus?: boolean;
  sortBy: 'name-asc' | 'name-desc' | 'products-asc' | 'products-desc' = 'name-asc';

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 1;

  // Delete confirmation
  brandToDelete?: BrandDto;
  showDeleteConfirm = false;

  // Add/Edit modal
  showModal = false;
  isEditMode = false;
  currentBrand?: BrandDto;
  brandForm: CreateBrandDto = {
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    websiteUrl: '',
    isActive: true,
    displayOrder: 0
  };

  // Form validation
  formErrors = {
    name: '',
    slug: ''
  };

  constructor(
    private adminBrandService: AdminBrandService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    this.error = '';

    this.adminBrandService.getBrands(true).subscribe({
      next: (brands) => {
        this.brands = brands;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลแบรนด์ได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลแบรนด์ได้');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading brands:', err);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.brands];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(b =>
        (b.name || '').toLowerCase().includes(query) ||
        (b.slug || '').toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.selectedStatus !== undefined) {
      result = result.filter(b => b.isActive === this.selectedStatus);
    }

    // Sort
    result = this.sortBrands(result);

    // Pagination
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredBrands = result.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  sortBrands(brands: BrandDto[]): BrandDto[] {
    return [...brands].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'products-asc':
          return (a.productCount || 0) - (b.productCount || 0);
        case 'products-desc':
          return (b.productCount || 0) - (a.productCount || 0);
        default:
          return 0;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  onAddNew(): void {
    this.isEditMode = false;
    this.currentBrand = undefined;
    this.brandForm = {
      name: '',
      slug: '',
      logoUrl: '',
      description: '',
      websiteUrl: '',
      isActive: true,
      displayOrder: 0
    };
    this.formErrors = {
      name: '',
      slug: ''
    };
    this.showModal = true;
  }

  onEdit(brand: BrandDto): void {
    this.isEditMode = true;
    this.currentBrand = brand;
    this.brandForm = {
      name: brand.name || '',
      slug: brand.slug || '',
      logoUrl: brand.logoUrl || '',
      description: brand.description || '',
      websiteUrl: brand.websiteUrl || '',
      isActive: brand.isActive ?? true,
      displayOrder: brand.displayOrder || 0
    };
    this.formErrors = {
      name: '',
      slug: ''
    };
    this.showModal = true;
  }

  onDeleteClick(brand: BrandDto): void {
    this.brandToDelete = brand;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.brandToDelete?.id) return;

    this.adminBrandService.deleteBrand(this.brandToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('ลบแบรนด์เรียบร้อยแล้ว');
        this.showDeleteConfirm = false;
        this.brandToDelete = undefined;
        this.loadBrands();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบแบรนด์ได้');
        console.error('Error deleting brand:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.brandToDelete = undefined;
  }

  onToggleStatus(brand: BrandDto): void {
    if (!brand.id) return;

    const newStatus = !brand.isActive;
    this.adminBrandService.toggleBrandStatus(brand.id, brand, newStatus).subscribe({
      next: () => {
        brand.isActive = newStatus;
        this.notificationService.success(
          newStatus ? 'เปิดใช้งานแบรนด์แล้ว' : 'ปิดใช้งานแบรนด์แล้ว'
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะแบรนด์ได้');
        console.error('Error toggling brand status:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onNameChange(): void {
    if (!this.isEditMode) {
      this.brandForm.slug = this.adminBrandService.generateSlug(this.brandForm.name);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.formErrors = {
      name: '',
      slug: ''
    };

    if (!this.brandForm.name.trim()) {
      this.formErrors.name = 'กรุณากรอกชื่อแบรนด์';
      isValid = false;
    }

    if (!this.brandForm.slug.trim()) {
      this.formErrors.slug = 'กรุณากรอก Slug';
      isValid = false;
    }

    return isValid;
  }

  onSaveForm(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.currentBrand?.id) {
      // Update existing brand
      this.adminBrandService.updateBrand(this.currentBrand.id, this.brandForm).subscribe({
        next: () => {
          this.notificationService.success('อัปเดตแบรนด์เรียบร้อยแล้ว');
          this.showModal = false;
          this.loadBrands();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถอัปเดตแบรนด์ได้');
          console.error('Error updating brand:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new brand
      this.adminBrandService.createBrand(this.brandForm).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มแบรนด์เรียบร้อยแล้ว');
          this.showModal = false;
          this.loadBrands();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถเพิ่มแบรนด์ได้');
          console.error('Error creating brand:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancelForm(): void {
    this.showModal = false;
    this.currentBrand = undefined;
  }

  getLogoUrl(brand: BrandDto): string {
    return brand.logoUrl || 'https://placehold.co/200x200/e5e7eb/6b7280/png?text=No+Logo';
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
    this.selectedStatus = undefined;
    this.sortBy = 'name-asc';
    this.currentPage = 1;
    this.applyFilters();
  }
}
