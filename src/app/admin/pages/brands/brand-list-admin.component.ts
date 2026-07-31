import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminBrandService } from '../../services/admin-brand.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
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
  brands = signal<BrandDto[]>([]);
  filteredBrands = signal<BrandDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedStatus = signal<boolean | undefined>(undefined);
  sortBy = signal<'name-asc' | 'name-desc' | 'products-asc' | 'products-desc'>('name-asc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Delete confirmation
  brandToDelete = signal<BrandDto | undefined>(undefined);
  showDeleteConfirm = signal(false);

  // Add/Edit modal
  showModal = signal(false);
  isEditMode = signal(false);
  currentBrand = signal<BrandDto | undefined>(undefined);
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
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminBrandService.getBrands(true).subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลแบรนด์ได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลแบรนด์ได้');
        this.loading.set(false);
        console.error('Error loading brands:', err);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.brands()];

    // Search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(b =>
        (b.name || '').toLowerCase().includes(query) ||
        (b.slug || '').toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.selectedStatus() !== undefined) {
      result = result.filter(b => b.isActive === this.selectedStatus());
    }

    // Sort
    result = this.sortBrands(result);

    // Pagination
    this.totalItems.set(result.length);
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.filteredBrands.set(result.slice(startIndex, endIndex));
  }

  sortBrands(brands: BrandDto[]): BrandDto[] {
    return [...brands].sort((a, b) => {
      switch (this.sortBy()) {
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
    this.currentPage.set(1);
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.applyFilters();
  }

  onAddNew(): void {
    this.isEditMode.set(false);
    this.currentBrand.set(undefined);
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
    this.showModal.set(true);
  }

  onEdit(brand: BrandDto): void {
    this.isEditMode.set(true);
    this.currentBrand.set(brand);
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
    this.showModal.set(true);
  }

  onDeleteClick(brand: BrandDto): void {
    this.brandToDelete.set(brand);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    if (!this.brandToDelete()?.id) return;

    this.adminBrandService.deleteBrand(this.brandToDelete()!.id!).subscribe({
      next: () => {
        this.notificationService.success('ลบแบรนด์เรียบร้อยแล้ว');
        this.showDeleteConfirm.set(false);
        this.brandToDelete.set(undefined);
        this.loadBrands();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบแบรนด์ได้');
        console.error('Error deleting brand:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.brandToDelete.set(undefined);
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
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะแบรนด์ได้');
        console.error('Error toggling brand status:', err);
      }
    });
  }

  onNameChange(): void {
    if (!this.isEditMode()) {
      this.brandForm = {
        ...this.brandForm,
        slug: this.adminBrandService.generateSlug(this.brandForm.name)
      };
    }
  }

  validateForm(): boolean {
    let isValid = true;
    const currentForm = this.brandForm;
    const errors = {
      name: '',
      slug: ''
    };

    if (!currentForm.name.trim()) {
      errors.name = 'กรุณากรอกชื่อแบรนด์';
      isValid = false;
    }

    if (!currentForm.slug.trim()) {
      errors.slug = 'กรุณากรอก Slug';
      isValid = false;
    }

    this.formErrors = errors;
    return isValid;
  }

  onSaveForm(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode() && this.currentBrand()?.id) {
      // Update existing brand
      this.adminBrandService.updateBrand(this.currentBrand()!.id!, this.brandForm).subscribe({
        next: () => {
          this.notificationService.success('อัปเดตแบรนด์เรียบร้อยแล้ว');
          this.showModal.set(false);
          this.loadBrands();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถอัปเดตแบรนด์ได้');
          console.error('Error updating brand:', err);
        }
      });
    } else {
      // Create new brand
      this.adminBrandService.createBrand(this.brandForm).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มแบรนด์เรียบร้อยแล้ว');
          this.showModal.set(false);
          this.loadBrands();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถเพิ่มแบรนด์ได้');
          console.error('Error creating brand:', err);
        }
      });
    }
  }

  onCancelForm(): void {
    this.showModal.set(false);
    this.currentBrand.set(undefined);
  }

  getLogoUrl(brand: BrandDto): string {
    return brand.logoUrl || 'https://placehold.co/200x200/e5e7eb/6b7280/png?text=No+Logo';
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
    this.selectedStatus.set(undefined);
    this.sortBy.set('name-asc');
    this.currentPage.set(1);
    this.applyFilters();
  }

  // Report downloads
  downloadExcel(): void {
    this.reportService.downloadBrandsExcel();
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    this.reportService.downloadBrandsPdf();
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
