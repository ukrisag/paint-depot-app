import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminOrderService } from '../../services/admin-order.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
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
  order = signal<OrderDetailDto | undefined>(undefined);
  orderId = signal<number | undefined>(undefined);

  loading = signal(true);
  updating = signal(false);
  error = signal('');

  // Status update form
  selectedStatus = signal('');
  trackingNumber = signal('');
  adminNotes = signal('');

  // Show cancel confirmation
  showCancelConfirm = signal(false);

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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(parseInt(id, 10));
      this.loadOrder(this.orderId()!);
    } else {
      this.error.set('ไม่พบรหัสคำสั่งซื้อ');
      this.loading.set(false);
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.adminOrderService.getOrderById(id).subscribe({
      next: (order) => {
        if (order) {
          this.order.set(order);
          this.selectedStatus.set(order.status || '');
          this.trackingNumber.set(order.shippingTrackingNumber || '');
          this.adminNotes.set(order.adminNotes || '');
        } else {
          this.error.set('ไม่พบคำสั่งซื้อ');
          this.notificationService.error('ไม่พบคำสั่งซื้อ');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        this.loading.set(false);
        console.error('Error loading order:', err);
      }
    });
  }

  onUpdateStatus(): void {
    if (!this.orderId() || !this.selectedStatus()) {
      this.notificationService.error('กรุณาเลือกสถานะ');
      return;
    }

    this.updating.set(true);

    const updateDto: UpdateOrderStatusDto = {
      status: this.selectedStatus(),
      trackingNumber: this.trackingNumber() || null,
      adminNotes: this.adminNotes() || null
    };

    this.adminOrderService.updateOrderStatus(this.orderId()!, updateDto).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          this.order.set(updatedOrder);
          this.notificationService.success('อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว');
        }
        this.updating.set(false);
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถอัปเดตสถานะได้');
        this.updating.set(false);
        console.error('Error updating order status:', err);
      }
    });
  }

  onCancelOrderClick(): void {
    this.showCancelConfirm.set(true);
  }

  onConfirmCancel(): void {
    if (!this.orderId()) return;

    this.updating.set(true);
    this.showCancelConfirm.set(false);

    const updateDto: UpdateOrderStatusDto = {
      status: 'cancelled',
      adminNotes: this.adminNotes() || null
    };

    this.adminOrderService.updateOrderStatus(this.orderId()!, updateDto).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          this.order.set(updatedOrder);
          this.selectedStatus.set('cancelled');
          this.notificationService.success('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
        }
        this.updating.set(false);
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถยกเลิกคำสั่งซื้อได้');
        this.updating.set(false);
        console.error('Error cancelling order:', err);
      }
    });
  }

  onCancelCancelOrder(): void {
    this.showCancelConfirm.set(false);
  }

  onBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  canCancelOrder(): boolean {
    return this.order()?.status === 'pending_payment' ||
           this.order()?.status === 'confirmed' ||
           this.order()?.status === 'processing';
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
    const order = this.order();
    return [
      {
        label: 'สั่งซื้อ',
        date: order?.orderedAt || order?.createdAt,
        completed: true
      },
      {
        label: 'ชำระเงิน',
        date: order?.paidAt,
        completed: !!order?.paidAt
      },
      {
        label: 'จัดส่ง',
        date: order?.shippedAt,
        completed: !!order?.shippedAt
      },
      {
        label: 'จัดส่งสำเร็จ',
        date: order?.deliveredAt,
        completed: !!order?.deliveredAt
      }
    ];
  }

  getFullAddress(): string {
    const order = this.order();
    const parts = [
      order?.shippingAddressLine1,
      order?.shippingAddressLine2,
      order?.shippingDistrict,
      order?.shippingProvince,
      order?.shippingPostalCode,
      order?.shippingCountry
    ].filter(part => part);

    return parts.join(', ') || '-';
  }

  /**
   * Download order details as PDF (A4)
   */
  downloadOrderPdf(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    try {
      this.reportService.downloadOrderPdf(currentOrder.id);
      this.notificationService.success('กำลังดาวน์โหลด PDF (A4)...');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      this.notificationService.error('ไม่สามารถดาวน์โหลด PDF ได้');
    }
  }

  /**
   * Download order details as PDF (Thermal 80mm)
   */
  downloadOrderPdfThermal(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    try {
      this.reportService.downloadOrderPdfThermal(currentOrder.id);
      this.notificationService.success('กำลังดาวน์โหลด PDF (Thermal)...');
    } catch (error) {
      console.error('Error downloading thermal PDF:', error);
      this.notificationService.error('ไม่สามารถดาวน์โหลด PDF ได้');
    }
  }

  /**
   * Download invoice PDF (A4)
   */
  downloadInvoice(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    try {
      this.reportService.downloadInvoicePdf(currentOrder.id);
      this.notificationService.success('กำลังดาวน์โหลดใบเสร็จ/ใบกำกับภาษี (A4)...');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      this.notificationService.error('ไม่สามารถดาวน์โหลดใบเสร็จได้');
    }
  }

  /**
   * Download invoice PDF (Thermal 80mm)
   */
  downloadInvoiceThermal(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    try {
      this.reportService.downloadInvoicePdfThermal(currentOrder.id);
      this.notificationService.success('กำลังดาวน์โหลดใบเสร็จ/ใบกำกับภาษี (Thermal)...');
    } catch (error) {
      console.error('Error downloading thermal invoice:', error);
      this.notificationService.error('ไม่สามารถดาวน์โหลดใบเสร็จได้');
    }
  }

  get isPaid(): boolean {
    const currentOrder = this.order();
    return !!currentOrder?.paidAt || currentOrder?.paymentStatus?.toLowerCase() === 'paid';
  }
}
