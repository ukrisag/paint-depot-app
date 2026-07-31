import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { CouponService } from '../../../services/coupon.service';
import { NotificationService } from '../../../services/notification.service';
import { CreateOrderDto } from '../../../services/openapi-client/model/models';
import { Cart, CartItem } from '../../../models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  checkoutForm!: FormGroup;
  currentStep = signal(1);
  totalSteps = 3;

  cart = signal<Cart | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);

  // Coupon
  couponCode = signal('');
  appliedCoupon = signal<any>(null);
  isValidatingCoupon = signal(false);

  // Shipping
  shippingFee = signal(50); // Flat rate 50 THB

  // Payment methods
  paymentMethods = [
    { value: 'transfer', label: 'โอนเงินผ่านธนาคาร', icon: '🏦' },
    { value: 'cash', label: 'เงินสด (ชำระที่ร้าน)', icon: '💵' }
  ];

  // Invoice types
  invoiceTypes = [
    { value: 'tax_invoice', label: 'ใบกำกับภาษี (Tax Invoice)', description: 'มี VAT 7%' },
    { value: 'cash_invoice', label: 'ใบเสร็จรับเงิน (Cash Receipt)', description: 'ไม่มี VAT' }
  ];

  // VAT rate
  readonly VAT_RATE = 0.07; // 7%

  // Bank details (shown when Bank Transfer is selected)
  bankDetails = {
    bankName: 'ธนาคารกสิกรไทย',
    accountName: 'บริษัท เพนท์ดีโป จำกัด',
    accountNumber: '123-4-56789-0',
    promptPayId: '0812345678'
  };

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private couponService: CouponService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCart();
    this.setupPaymentMethodListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      // Step 1: Shipping Information
      shippingInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.required, Validators.minLength(10)]],
        subDistrict: ['', Validators.required],
        district: ['', Validators.required],
        province: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
        saveAsDefault: [false]
      }),

      // Step 2: Payment Method
      paymentInfo: this.fb.group({
        paymentMethod: ['transfer', Validators.required],
        invoiceType: ['tax_invoice', Validators.required],
        customerNotes: ['']
      })
    });
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart.set(cart);
          this.isLoading.set(false);

          // Redirect to cart if empty
          if (!cart || cart.items.length === 0) {
            this.notificationService.error('ตะกร้าสินค้าของคุณว่างเปล่า');
            this.router.navigate(['/cart']);
          }
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.isLoading.set(false);
          this.notificationService.error('ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้');
        }
      });
  }

  /**
   * Auto-set invoice type when payment method changes
   */
  setupPaymentMethodListener(): void {
    this.paymentInfoForm.get('paymentMethod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((paymentMethod) => {
        // Auto-set invoice type based on payment method
        const invoiceType = paymentMethod === 'cash' ? 'cash_invoice' : 'tax_invoice';
        this.paymentInfoForm.patchValue({ invoiceType }, { emitEvent: false });
      });
  }

  // Step Navigation
  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.shippingInfoForm.invalid) {
        this.markFormGroupTouched(this.shippingInfoForm);
        this.notificationService.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
    } else if (this.currentStep() === 2) {
      if (this.paymentInfoForm.invalid) {
        this.markFormGroupTouched(this.paymentInfoForm);
        this.notificationService.error('กรุณาเลือกวิธีการชำระเงิน');
        return;
      }
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(step => step + 1);
      this.scrollToTop();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    // Can only go back or to completed steps
    if (step < this.currentStep()) {
      this.currentStep.set(step);
      this.scrollToTop();
    }
  }

  // Coupon Validation
  validateCoupon(): void {
    const code = this.couponCode();
    if (!code || code.trim() === '') {
      this.notificationService.error('กรุณากรอกรหัสคูปอง');
      return;
    }

    this.isValidatingCoupon.set(true);
    const subtotal = this.getSubtotal();

    this.couponService.validateCoupon(code.trim(), subtotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.isValidatingCoupon.set(false);
          if (result.isValid) {
            this.appliedCoupon.set(result);
            this.notificationService.success('ใช้คูปองสำเร็จ');
          } else {
            this.notificationService.error(result.message || 'คูปองไม่ถูกต้อง');
          }
        },
        error: (error) => {
          this.isValidatingCoupon.set(false);
          this.notificationService.error(error.error?.message || 'ไม่สามารถตรวจสอบคูปองได้');
        }
      });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode.set('');
    this.notificationService.info('ยกเลิกการใช้คูปอง');
  }

  // Order Submission
  submitOrder(): void {
    if (this.checkoutForm.invalid) {
      this.notificationService.error('กรุณาตรวจสอบข้อมูลให้ครบถ้วน');
      return;
    }

    const currentCart = this.cart();
    if (!currentCart || currentCart.items.length === 0) {
      this.notificationService.error('ตะกร้าสินค้าของคุณว่างเปล่า');
      return;
    }

    const shipping = this.shippingInfoForm.value;
    const payment = this.paymentInfoForm.value;

    const orderData: CreateOrderDto = {
      // Shipping Information
      shippingFullName: `${shipping.firstName} ${shipping.lastName}`,
      shippingPhone: shipping.phone,
      shippingEmail: shipping.email,
      shippingAddressLine1: shipping.address,
      shippingAddressLine2: null,
      shippingSubDistrict: shipping.subDistrict,
      shippingDistrict: shipping.district,
      shippingProvince: shipping.province,
      shippingPostalCode: shipping.postalCode,

      // Payment Information
      paymentMethod: payment.paymentMethod,
      invoiceType: payment.invoiceType,
      shippingMethod: 'Standard', // Default shipping method

      // Optional
      couponCode: this.appliedCoupon() ? this.couponCode() : null,
      customerNotes: payment.customerNotes || null
    };

    this.isSubmitting.set(true);

    this.orderService.createOrder(orderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.isSubmitting.set(false);
          this.notificationService.success('สั่งซื้อสินค้าสำเร็จ');

          // Clear cart
          this.cartService.clearCart().subscribe();

          // Navigate to order confirmation
          this.router.navigate(['/order-confirmation', order.id]);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Error creating order:', error);
          this.notificationService.error(
            error.error?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง'
          );
        }
      });
  }

  // Calculations
  getSubtotal(): number {
    return this.cart()?.subtotal || 0;
  }

  getDiscountAmount(): number {
    return this.appliedCoupon()?.discountAmount || 0;
  }

  getShippingFee(): number {
    return this.shippingFee();
  }

  getTaxAmount(): number {
    const invoiceType = this.paymentInfoForm.get('invoiceType')?.value;
    if (invoiceType === 'tax_invoice') {
      const taxableAmount = this.getSubtotal() - this.getDiscountAmount() + this.getShippingFee();
      return Math.round(taxableAmount * this.VAT_RATE * 100) / 100;
    }
    return 0;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    const tax = this.getTaxAmount();
    return subtotal - discount + shipping + tax;
  }

  // Form Getters
  get shippingInfoForm(): FormGroup {
    return this.checkoutForm.get('shippingInfo') as FormGroup;
  }

  get paymentInfoForm(): FormGroup {
    return this.checkoutForm.get('paymentInfo') as FormGroup;
  }

  get selectedPaymentMethod(): string {
    return this.paymentInfoForm.get('paymentMethod')?.value;
  }

  get selectedInvoiceType(): string {
    return this.paymentInfoForm.get('invoiceType')?.value;
  }

  get isCashPayment(): boolean {
    return this.selectedPaymentMethod === 'cash';
  }

  get isTaxInvoice(): boolean {
    return this.selectedInvoiceType === 'tax_invoice';
  }

  // Helper Methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'กรุณากรอกข้อมูลนี้';
    if (field.errors['email']) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (field.errors['minlength']) {
      return `ต้องมีอย่างน้อย ${field.errors['minlength'].requiredLength} ตัวอักษร`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'phone') return 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
      if (fieldName === 'postalCode') return 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }

    return 'ข้อมูลไม่ถูกต้อง';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getCartItemImage(item: CartItem): string {
    return item.product?.images?.[0]?.imageUrl || '/assets/images/placeholder.png';
  }

  getCartItemName(item: CartItem): string {
    return item.product?.name || 'Unknown Product';
  }

  getCartItemVariantName(item: CartItem): string {
    return item.variant?.name || '';
  }
}
