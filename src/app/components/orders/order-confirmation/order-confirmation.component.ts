import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { OrderDetailDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
  // Temporarily disable OnPush to test
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order = signal<OrderDetailDto | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed signals for reactive values
  subtotalBeforeDiscount = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    return currentOrder.subtotal || 0;
  });

  isBankTransfer = computed(() => {
    return this.order()?.paymentMethod === 'transfer';
  });

  // Bank details for payment instructions
  bankDetails = {
    bankName: 'ธนาคารกสิกรไทย',
    accountName: 'บริษัท เพนท์ดีโป จำกัด',
    accountNumber: '123-4-56789-0',
    promptPayId: '0812345678'
  };

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    console.log('OrderConfirmationComponent constructor called');
  }

  ngOnInit(): void {
    console.log('OrderConfirmationComponent ngOnInit called');
    const orderId = this.route.snapshot.paramMap.get('id');
    console.log('Order ID from route:', orderId);
    if (orderId) {
      this.loadOrder(+orderId);
    } else {
      console.log('No order ID found in route');
      this.error.set('ไม่พบหมายเลขคำสั่งซื้อ');
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(orderId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    console.log('Loading order with ID:', orderId);

    this.orderService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          console.log('Order loaded successfully:', order);
          console.log('Order items:', order?.items);
          this.order.set(order);
          this.isLoading.set(false);
          this.cdr.markForCheck(); // Force change detection
        },
        error: (err) => {
          console.error('Error loading order:', err);
          console.error('Error details:', err.error);
          this.error.set('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
          this.isLoading.set(false);
          this.cdr.markForCheck(); // Force change detection
          this.notificationService.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
        }
      });
  }

  viewOrderDetail(): void {
    const currentOrder = this.order();
    if (currentOrder?.id) {
      this.router.navigate(['/orders', currentOrder.id]);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '฿0.00';
    return `฿${amount.toFixed(2)}`;
  }
}
