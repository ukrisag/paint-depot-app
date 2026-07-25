import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminOrderService } from '../../services/admin-order.service';
import { NotificationService } from '../../../services/notification.service';
import { OrderDetailDto } from '../../../services/openapi-client/model/orderDetailDto';
import { UpdateOrderStatusDto } from '../../../services/openapi-client/model/updateOrderStatusDto';

@Component({
  selector: 'app-order-detail-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail-admin.component.html',
  styleUrls: ['./order-detail-admin.component.css']
})
export class OrderDetailAdminComponent implements OnInit {
  order?: OrderDetailDto;
  orderId?: number;

  loading = true;
  updating = false;
  error = '';

  // Status update form
  selectedStatus = '';
  trackingNumber = '';
  adminNotes = '';

  // Show cancel confirmation
  showCancelConfirm = false;

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
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId = parseInt(id, 10);
      this.loadOrder(this.orderId);
    } else {
      this.error = 'ไม่พบรหัสคำสั่งซื้อ';
      this.loading = false;
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = '';

    this.adminOrderService.getOrderById(id).subscribe({
      next: (order) => {
        if (order) {
          this.order = order;
          this.selectedStatus = order.status || '';
          this.trackingNumber = order.shippingTrackingNumber || '';
          this.adminNotes = order.adminNotes || '';
        } else {
          this.error = 'ไม่พบคำสั่งซื้อ';
          this.notificationService.error('ไม่พบคำสั่งซื้อ');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading order:', err);
      }
    });
  }

  onUpdateStatus(): void {
    if (!this.orderId || !this.selectedStatus) {
      this.notificationService.error('กรุณาเลือกสถานะ');
      return;
    }

    this.updating = true;

    const updateDto: UpdateOrderStatusDto = {
      status: this.selectedStatus,
      trackingNumber: this.trackingNumber || null,
      adminNotes: this.adminNotes || null
    };

    this.adminOrderService.updateOrderStatus(this.orderId, updateDto).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          this.order = updatedOrder;
          this.notificationService.success('อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว');
        }
        this.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถอัปเดตสถานะได้');
        this.updating = false;
        this.cdr.detectChanges();
        console.error('Error updating order status:', err);
      }
    });
  }

  onCancelOrderClick(): void {
    this.showCancelConfirm = true;
  }

  onConfirmCancel(): void {
    if (!this.orderId) return;

    this.updating = true;
    this.showCancelConfirm = false;

    const updateDto: UpdateOrderStatusDto = {
      status: 'cancelled',
      adminNotes: this.adminNotes || null
    };

    this.adminOrderService.updateOrderStatus(this.orderId, updateDto).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          this.order = updatedOrder;
          this.selectedStatus = 'cancelled';
          this.notificationService.success('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
        }
        this.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถยกเลิกคำสั่งซื้อได้');
        this.updating = false;
        this.cdr.detectChanges();
        console.error('Error cancelling order:', err);
      }
    });
  }

  onCancelCancelOrder(): void {
    this.showCancelConfirm = false;
  }

  onBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  canCancelOrder(): boolean {
    return this.order?.status === 'pending_payment' ||
           this.order?.status === 'confirmed' ||
           this.order?.status === 'processing';
  }

  getStatusLabel(status: string | null | undefined): string {
    if (!status) return '-';
    const statusObj = this.orderStatuses.find(s => s.value === status);
    return statusObj?.label || status;
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'pending_payment':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800';
      case 'processing':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800';
      case 'shipped':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800';
      case 'cancelled':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800';
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getOrderTimeline(): { label: string; date: string | null | undefined; completed: boolean }[] {
    return [
      {
        label: 'สั่งซื้อ',
        date: this.order?.orderedAt || this.order?.createdAt,
        completed: true
      },
      {
        label: 'ชำระเงิน',
        date: this.order?.paidAt,
        completed: !!this.order?.paidAt
      },
      {
        label: 'จัดส่ง',
        date: this.order?.shippedAt,
        completed: !!this.order?.shippedAt
      },
      {
        label: 'จัดส่งสำเร็จ',
        date: this.order?.deliveredAt,
        completed: !!this.order?.deliveredAt
      }
    ];
  }

  getFullAddress(): string {
    const parts = [
      this.order?.shippingAddressLine1,
      this.order?.shippingAddressLine2,
      this.order?.shippingDistrict,
      this.order?.shippingProvince,
      this.order?.shippingPostalCode,
      this.order?.shippingCountry
    ].filter(part => part);

    return parts.join(', ') || '-';
  }
}
