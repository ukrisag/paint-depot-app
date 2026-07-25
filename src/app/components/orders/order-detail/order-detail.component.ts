import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { OrderDetailDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order: OrderDetailDto | null = null;
  isLoading = true;
  isCancelling = false;
  isUploadingSlip = false;
  error: string | null = null;

  // Payment slip upload
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  showUploadForm = false;

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

  cancelOrder(): void {
    if (!this.order?.id) return;

    this.notificationService.confirm(
      'คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?',
      () => {
        this.isCancelling = true;
        this.cdr.detectChanges();
        this.orderService.cancelOrder(this.order!.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.success('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
              this.isCancelling = false;
              this.cdr.detectChanges();
              this.loadOrder(this.order!.id!);
            },
            error: (err) => {
              console.error('Error cancelling order:', err);
              this.notificationService.error('ไม่สามารถยกเลิกคำสั่งซื้อได้');
              this.isCancelling = false;
              this.cdr.detectChanges();
            }
          });
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (jpg, png, gif, webp)');
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
        input.value = '';
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.filePreviewUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPaymentSlip(): void {
    if (!this.order?.id || !this.selectedFile) {
      this.notificationService.error('กรุณาเลือกไฟล์สลิปการโอนเงิน');
      return;
    }

    this.isUploadingSlip = true;
    this.cdr.detectChanges();

    // First, upload the file to get the URL, then update the order
    this.orderService.uploadPaymentSlipFile(this.selectedFile)
      .pipe(
        switchMap(fileUrl => this.orderService.uploadPaymentSlip(this.order!.id!, fileUrl)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.selectedFile = null;
          this.filePreviewUrl = null;
          this.showUploadForm = false;
          this.isUploadingSlip = false;
          this.notificationService.success('อัปโหลดสลิปการโอนเงินเรียบร้อยแล้ว');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error uploading payment slip:', err);
          this.notificationService.error('ไม่สามารถอัปโหลดสลิปการโอนเงินได้');
          this.isUploadingSlip = false;
          this.cdr.detectChanges();
        }
      });
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) {
      this.selectedFile = null;
      this.filePreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusBadgeClass(status: string | null | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('pending') || statusLower.includes('payment')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('process') || statusLower.includes('confirmed')) {
      return 'bg-blue-100 text-blue-800';
    } else if (statusLower.includes('ship')) {
      return 'bg-purple-100 text-purple-800';
    } else if (statusLower.includes('delivered') || statusLower.includes('complete')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('cancel') || statusLower.includes('refund')) {
      return 'bg-red-100 text-red-800';
    }

    return 'bg-gray-100 text-gray-800';
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

  getTimelineSteps(): { label: string; date: string | null; active: boolean; completed: boolean }[] {
    if (!this.order) return [];

    const status = this.order.status?.toLowerCase() || '';
    const isCancelled = status.includes('cancel');

    if (isCancelled) {
      return [
        { label: 'สั่งซื้อ', date: this.order.orderedAt || this.order.createdAt || null, active: false, completed: true },
        { label: 'ยกเลิก', date: this.order.cancelledAt || null, active: true, completed: true }
      ];
    }

    const steps = [
      {
        label: 'สั่งซื้อ',
        date: this.order.orderedAt || this.order.createdAt || null,
        active: false,
        completed: true
      },
      {
        label: 'ชำระเงิน',
        date: this.order.paidAt || null,
        active: !this.order.paidAt && !status.includes('ship') && !status.includes('delivered'),
        completed: !!this.order.paidAt
      },
      {
        label: 'จัดส่ง',
        date: this.order.shippedAt || null,
        active: !!this.order.paidAt && !this.order.shippedAt && !status.includes('delivered'),
        completed: !!this.order.shippedAt
      },
      {
        label: 'ได้รับสินค้า',
        date: this.order.deliveredAt || null,
        active: !!this.order.shippedAt && !this.order.deliveredAt,
        completed: !!this.order.deliveredAt
      }
    ];

    return steps;
  }

  get canCancel(): boolean {
    if (!this.order?.status) return false;
    const status = this.order.status.toLowerCase();
    return (status === 'pending_payment' || status === 'confirmed' || status === 'processing') && !status.includes('cancel');
  }

  get canUploadPaymentSlip(): boolean {
    if (!this.order?.status || this.order.paymentSlipUrl) return false;
    const status = this.order.status.toLowerCase();
    return (status === 'pending_payment' || status === 'confirmed') && this.isBankTransfer;
  }

  get isPending(): boolean {
    if (!this.order?.status) return false;
    return this.order.status.toLowerCase().includes('pending');
  }

  get isBankTransfer(): boolean {
    return this.order?.paymentMethod === 'BankTransfer';
  }

  get isPaid(): boolean {
    return !!this.order?.paidAt || this.order?.paymentStatus?.toLowerCase() === 'paid';
  }

  get subtotalBeforeDiscount(): number {
    if (!this.order) return 0;
    return (this.order.subtotal || 0) + (this.order.discountAmount || 0);
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

  formatShortDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      month: 'short',
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
