import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order: OrderDetailDto | null = null;
  isLoading = true;
  error: string | null = null;

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
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(+orderId);
    } else {
      this.error = 'ไม่พบหมายเลขคำสั่งซื้อ';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(orderId: number): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.orderService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading order:', err);
          this.error = 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้';
          this.isLoading = false;
          this.notificationService.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
          this.cdr.detectChanges();
        }
      });
  }

  viewOrderDetail(): void {
    if (this.order?.id) {
      this.router.navigate(['/orders', this.order.id]);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  get subtotalBeforeDiscount(): number {
    if (!this.order) return 0;
    return (this.order.subtotal || 0) + (this.order.discountAmount || 0);
  }

  get isBankTransfer(): boolean {
    return this.order?.paymentMethod === 'BankTransfer';
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
