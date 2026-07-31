import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { OrderDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders = signal<OrderDto[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.orderService.getMyOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.error.set('ไม่สามารถโหลดรายการคำสั่งซื้อได้');
          this.isLoading.set(false);
          this.notificationService.error('เกิดข้อผิดพลาดในการโหลดรายการคำสั่งซื้อ');
        }
      });
  }

  viewOrderDetail(orderId: number | undefined): void {
    if (orderId) {
      this.router.navigate(['/orders', orderId]);
    }
  }

  getStatusBadgeClass(status: string | null | undefined): string {
    if (!status) return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('pending') || statusLower.includes('payment')) {
      return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800';
    } else if (statusLower.includes('process') || statusLower.includes('confirmed')) {
      return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800';
    } else if (statusLower.includes('ship')) {
      return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800';
    } else if (statusLower.includes('delivered') || statusLower.includes('complete')) {
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
    } else if (statusLower.includes('cancel') || statusLower.includes('refund')) {
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800';
    }

    return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
  }

  getStatusLabel(status: string | null | undefined): string {
    if (!status) return 'ไม่ทราบสถานะ';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('pending')) {
      return 'รอดำเนินการ';
    } else if (statusLower.includes('process')) {
      return 'กำลังดำเนินการ';
    } else if (statusLower.includes('ship')) {
      return 'กำลังจัดส่ง';
    } else if (statusLower.includes('delivered')) {
      return 'จัดส่งแล้ว';
    } else if (statusLower.includes('cancel')) {
      return 'ยกเลิกแล้ว';
    } else if (statusLower.includes('refund')) {
      return 'คืนเงินแล้ว';
    }

    return status;
  }

  getItemCount(order: OrderDto): number {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
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

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '฿0.00';
    return `฿${amount.toFixed(2)}`;
  }

  get hasOrders(): boolean {
    return this.orders() && this.orders().length > 0;
  }
}
