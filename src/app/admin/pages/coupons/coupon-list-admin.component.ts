import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminCouponService } from '../../services/admin-coupon.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
import { CouponDto } from '../../../services/openapi-client/model/couponDto';

@Component({
  selector: 'app-coupon-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupon-list-admin.component.html',
  styleUrls: ['./coupon-list-admin.component.css']
})
export class CouponListAdminComponent implements OnInit {
  coupons = signal<CouponDto[]>([]);
  filteredCoupons = signal<CouponDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedStatus = signal<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Delete confirmation
  couponToDelete = signal<CouponDto | undefined>(undefined);
  showDeleteConfirm = signal(false);

  constructor(
    private adminCouponService: AdminCouponService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminCouponService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set(coupons);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลคูปองได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลคูปองได้');
        this.loading.set(false);
        console.error('Error loading coupons:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.coupons()];

    // Search filter
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(coupon =>
        coupon.code?.toLowerCase().includes(query)
      );
    }

    // Status filter
    const now = new Date();
    filtered = filtered.filter(coupon => {
      switch (this.selectedStatus()) {
        case 'active':
          return coupon.isActive && this.isValidDate(coupon, now);
        case 'inactive':
          return !coupon.isActive;
        case 'expired':
          return this.isExpired(coupon, now);
        default:
          return true;
      }
    });

    this.filteredCoupons.set(filtered);
    this.totalItems.set(filtered.length);
    this.currentPage.set(1);
  }

  isValidDate(coupon: CouponDto, now: Date): boolean {
    const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;

    if (validFrom && now < validFrom) return false;
    if (validUntil && now > validUntil) return false;
    return true;
  }

  isExpired(coupon: CouponDto, now: Date): boolean {
    if (!coupon.validUntil) return false;
    return now > new Date(coupon.validUntil);
  }

  getPaginatedCoupons(): CouponDto[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredCoupons().slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onAddNew(): void {
    this.router.navigate(['/admin/coupons/create']);
  }

  onEdit(couponId: number | undefined): void {
    if (!couponId) return;
    this.router.navigate(['/admin/coupons/edit', couponId]);
  }

  onDeleteClick(coupon: CouponDto): void {
    this.couponToDelete.set(coupon);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    if (!this.couponToDelete()?.id) return;

    this.adminCouponService.deleteCoupon(this.couponToDelete()!.id!).subscribe({
      next: () => {
        this.notificationService.success('ลบคูปองเรียบร้อยแล้ว');
        this.showDeleteConfirm.set(false);
        this.couponToDelete.set(undefined);
        this.loadCoupons();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบคูปองได้');
        console.error('Error deleting coupon:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.couponToDelete.set(undefined);
  }

  onToggleStatus(coupon: CouponDto): void {
    if (!coupon.id) return;

    this.adminCouponService.toggleCouponStatus(coupon.id, coupon).subscribe({
      next: (updatedCoupon) => {
        if (updatedCoupon) {
          coupon.isActive = updatedCoupon.isActive;
        }
        this.notificationService.success(
          coupon.isActive ? 'เปิดใช้งานคูปองแล้ว' : 'ปิดใช้งานคูปองแล้ว'
        );
        this.applyFilters();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะคูปองได้');
        console.error('Error toggling coupon status:', err);
      }
    });
  }

  getCouponStatus(coupon: CouponDto): string {
    const now = new Date();

    if (!coupon.isActive) return 'Inactive';
    if (this.isExpired(coupon, now)) return 'Expired';
    if (!this.isValidDate(coupon, now)) return 'Pending';
    return 'Active';
  }

  getStatusClass(coupon: CouponDto): string {
    const status = this.getCouponStatus(coupon);
    switch (status) {
      case 'Active':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'Inactive':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
      case 'Expired':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      case 'Pending':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  formatDiscount(coupon: CouponDto): string {
    if (coupon.type === 'Percentage') {
      return `${coupon.value}%`;
    } else {
      return `฿${coupon.value}`;
    }
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: number | null | undefined): string {
    if (!price) return '-';
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
    this.selectedStatus.set('all');
    this.currentPage.set(1);
    this.applyFilters();
  }

  // Report downloads
  downloadExcel(): void {
    const activeOnly = this.selectedStatus() === 'active' ? true : this.selectedStatus() === 'inactive' ? false : undefined;
    this.reportService.downloadCouponsExcel(activeOnly);
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    const activeOnly = this.selectedStatus() === 'active' ? true : this.selectedStatus() === 'inactive' ? false : undefined;
    this.reportService.downloadCouponsPdf(activeOnly);
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
