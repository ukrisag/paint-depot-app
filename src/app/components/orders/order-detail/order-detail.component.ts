import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
import { AuthService } from '../../../services/auth.service';
import { OrderDetailDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
  // Temporarily disable OnPush to test
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order = signal<OrderDetailDto | null>(null);
  isLoading = signal(true);
  isCancelling = signal(false);
  isUploadingSlip = signal(false);
  error = signal<string | null>(null);

  // Payment slip upload
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  showUploadForm = signal(false);

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
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('OrderDetailComponent constructor called');
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  ngOnInit(): void {
    console.log('OrderDetailComponent ngOnInit called');
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
          console.log('Order status:', order?.status);
          console.log('Order payment method:', order?.paymentMethod);
          this.order.set(order);
          this.isLoading.set(false);
          console.log('After setting - isLoading():', this.isLoading());
          console.log('After setting - order():', this.order());
          console.log('After setting - order() is truthy?', !!this.order());
        },
        error: (err) => {
          console.error('Error loading order:', err);
          console.error('Error details:', err.error);
          this.error.set('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
          this.isLoading.set(false);
          this.notificationService.error('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
        }
      });
  }

  cancelOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    this.notificationService.confirm(
      'คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?',
      () => {
        this.isCancelling.set(true);
        this.orderService.cancelOrder(currentOrder.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.success('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
              this.isCancelling.set(false);
              this.loadOrder(currentOrder.id!);
            },
            error: (err) => {
              console.error('Error cancelling order:', err);
              this.notificationService.error('ไม่สามารถยกเลิกคำสั่งซื้อได้');
              this.isCancelling.set(false);
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
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPaymentSlip(): void {
    const currentOrder = this.order();
    if (!currentOrder?.id || !this.selectedFile) {
      this.notificationService.error('กรุณาเลือกไฟล์สลิปการโอนเงิน');
      return;
    }

    this.isUploadingSlip.set(true);

    // First, upload the file to get the URL, then update the order
    this.orderService.uploadPaymentSlipFile(this.selectedFile)
      .pipe(
        switchMap(fileUrl => this.orderService.uploadPaymentSlip(currentOrder.id!, fileUrl)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updatedOrder) => {
          this.order.set(updatedOrder);
          this.selectedFile = null;
          this.filePreviewUrl = null;
          this.showUploadForm.set(false);
          this.isUploadingSlip.set(false);
          this.notificationService.success('อัปโหลดสลิปการโอนเงินเรียบร้อยแล้ว');
        },
        error: (err) => {
          console.error('Error uploading payment slip:', err);
          this.notificationService.error('ไม่สามารถอัปโหลดสลิปการโอนเงินได้');
          this.isUploadingSlip.set(false);
        }
      });
  }

  toggleUploadForm(): void {
    this.showUploadForm.update(show => !show);
    if (!this.showUploadForm()) {
      this.selectedFile = null;
      this.filePreviewUrl = null;
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  /**
   * Download order details as PDF (A4 - default)
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
   * Download order details as PDF (Thermal 80mm - for admin)
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
   * Download invoice PDF (A4 - default)
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
   * Download invoice PDF (Thermal 80mm - for admin)
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

  getTimelineSteps(): { label: string; date: string | null; active: boolean; completed: boolean }[] {
    const currentOrder = this.order();
    if (!currentOrder) return [];

    const status = currentOrder.status?.toLowerCase() || '';
    const isCancelled = status.includes('cancel');

    if (isCancelled) {
      return [
        { label: 'สั่งซื้อ', date: currentOrder.orderedAt || currentOrder.createdAt || null, active: false, completed: true },
        { label: 'ยกเลิก', date: currentOrder.cancelledAt || null, active: true, completed: true }
      ];
    }

    const steps = [
      {
        label: 'สั่งซื้อ',
        date: currentOrder.orderedAt || currentOrder.createdAt || null,
        active: false,
        completed: true
      },
      {
        label: 'ชำระเงิน',
        date: currentOrder.paidAt || null,
        active: !currentOrder.paidAt && !status.includes('ship') && !status.includes('delivered'),
        completed: !!currentOrder.paidAt
      },
      {
        label: 'จัดส่ง',
        date: currentOrder.shippedAt || null,
        active: !!currentOrder.paidAt && !currentOrder.shippedAt && !status.includes('delivered'),
        completed: !!currentOrder.shippedAt
      },
      {
        label: 'ได้รับสินค้า',
        date: currentOrder.deliveredAt || null,
        active: !!currentOrder.shippedAt && !currentOrder.deliveredAt,
        completed: !!currentOrder.deliveredAt
      }
    ];

    return steps;
  }

  get canCancel(): boolean {
    const currentOrder = this.order();
    if (!currentOrder?.status) return false;

    // Cannot cancel if payment is already completed
    if (currentOrder.paymentStatus?.toLowerCase() === 'paid') {
      return false;
    }

    const status = currentOrder.status.toLowerCase();
    return (status === 'pending_payment' || status === 'confirmed' || status === 'processing') && !status.includes('cancel');
  }

  get canUploadPaymentSlip(): boolean {
    const currentOrder = this.order();
    if (!currentOrder?.status || currentOrder.paymentSlipUrl) return false;
    const status = currentOrder.status.toLowerCase();
    return (status === 'pending_payment' || status === 'confirmed') && this.isBankTransfer;
  }

  get isPending(): boolean {
    const currentOrder = this.order();
    if (!currentOrder?.status) return false;
    return currentOrder.status.toLowerCase().includes('pending');
  }

  get isBankTransfer(): boolean {
    return this.order()?.paymentMethod === 'BankTransfer';
  }

  get isPaid(): boolean {
    const currentOrder = this.order();
    return !!currentOrder?.paidAt || currentOrder?.paymentStatus?.toLowerCase() === 'paid';
  }

  get subtotalBeforeDiscount(): number {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    return (currentOrder.subtotal || 0) + (currentOrder.discountAmount || 0);
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

  get invoiceTypeLabel(): string {
    const currentOrder = this.order();
    if (!currentOrder?.invoiceType) return '-';
    return currentOrder.invoiceType === 'tax_invoice'
      ? 'ใบกำกับภาษี (Tax Invoice)'
      : 'ใบเสร็จรับเงิน (Cash Receipt)';
  }

  get isTaxInvoice(): boolean {
    return this.order()?.invoiceType === 'tax_invoice';
  }

  get hasTax(): boolean {
    return (this.order()?.taxAmount ?? 0) > 0;
  }
}
