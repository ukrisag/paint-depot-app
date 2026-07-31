import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminOrderService } from '../../services/admin-order.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
import { OrderDto } from '../../../services/openapi-client/model/orderDto';

@Component({
  selector: 'app-order-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list-admin.component.html',
  styleUrls: ['./order-list-admin.component.css']
})
export class OrderListAdminComponent implements OnInit {
  orders = signal<OrderDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedStatus = signal<string | undefined>(undefined);
  startDate = signal('');
  endDate = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Order statuses
  orderStatuses = [
    { value: 'pending_payment', label: 'รอชำระเงิน' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'processing', label: 'กำลังเตรียมสินค้า' },
    { value: 'shipped', label: 'จัดส่งแล้ว' },
    { value: 'delivered', label: 'จัดส่งสำเร็จ' },
    { value: 'cancelled', label: 'ยกเลิก' }
  ];

  constructor(
    private adminOrderService: AdminOrderService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminOrderService.getAllOrders(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        let orders = response.data;

        // Apply filters
        orders = this.applyFilters(orders);

        this.orders.set(orders);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  applyFilters(orders: OrderDto[]): OrderDto[] {
    let filtered = [...orders];

    // Filter by search query (order number)
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedStatus()) {
      filtered = filtered.filter(order => order.status === this.selectedStatus());
    }

    // Filter by date range
    if (this.startDate()) {
      filtered = filtered.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        const start = new Date(this.startDate());
        return orderDate >= start;
      });
    }

    if (this.endDate()) {
      filtered = filtered.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        const end = new Date(this.endDate());
        end.setHours(23, 59, 59, 999); // Include the entire end date
        return orderDate <= end;
      });
    }

    return filtered;
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadOrders();
  }

  onViewDetail(orderId: number | undefined): void {
    if (!orderId) return;
    this.router.navigate(['/admin/orders', orderId]);
  }

  getStatusLabel(status: string | null | undefined): string {
    if (!status) return '-';
    const statusObj = this.orderStatuses.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'pending_payment':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
      case 'processing':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800';
      case 'shipped':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'cancelled':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '฿0';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  // Report downloads
  downloadExcel(): void {
    this.reportService.downloadOrdersExcel(this.startDate() || undefined, this.endDate() || undefined, this.selectedStatus());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    this.reportService.downloadOrdersPdf(this.startDate() || undefined, this.endDate() || undefined, this.selectedStatus());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
