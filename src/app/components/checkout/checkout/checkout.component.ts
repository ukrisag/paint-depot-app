import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  checkoutForm!: FormGroup;
  currentStep = 1;
  totalSteps = 3;

  cart: Cart | null = null;
  isLoading = false;
  isSubmitting = false;

  // Coupon
  couponCode = '';
  appliedCoupon: any = null;
  isValidatingCoupon = false;

  // Shipping
  shippingFee = 50; // Flat rate 50 THB

  // Payment methods
  paymentMethods = [
    { value: 'BankTransfer', label: 'โอนเงินผ่านธนาคาร', icon: '🏦' },
    { value: 'CashOnDelivery', label: 'ชำระเงินปลายทาง (COD)', icon: '💵' }
  ];

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCart();
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
        paymentMethod: ['BankTransfer', Validators.required],
        customerNotes: ['']
      })
    });
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;

          // Redirect to cart if empty
          if (!cart || cart.items.length === 0) {
            this.notificationService.error('ตะกร้าสินค้าของคุณว่างเปล่า');
            this.router.navigate(['/cart']);
          }
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.isLoading = false;
          this.notificationService.error('ไม่สามารถโหลดข้อมูลตะกร้าสินค้าได้');
        }
      });
  }

  // Step Navigation
  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.shippingInfoForm.invalid) {
        this.markFormGroupTouched(this.shippingInfoForm);
        this.notificationService.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
    } else if (this.currentStep === 2) {
      if (this.paymentInfoForm.invalid) {
        this.markFormGroupTouched(this.paymentInfoForm);
        this.notificationService.error('กรุณาเลือกวิธีการชำระเงิน');
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    // Can only go back or to completed steps
    if (step < this.currentStep) {
      this.currentStep = step;
      this.scrollToTop();
    }
  }

  // Coupon Validation
  validateCoupon(): void {
    if (!this.couponCode || this.couponCode.trim() === '') {
      this.notificationService.error('กรุณากรอกรหัสคูปอง');
      return;
    }

    this.isValidatingCoupon = true;
    this.cdr.detectChanges();
    const subtotal = this.getSubtotal();

    this.couponService.validateCoupon(this.couponCode.trim(), subtotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.isValidatingCoupon = false;
          if (result.isValid) {
            this.appliedCoupon = result;
            this.notificationService.success('ใช้คูปองสำเร็จ');
          } else {
            this.notificationService.error(result.message || 'คูปองไม่ถูกต้อง');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isValidatingCoupon = false;
          this.notificationService.error(error.error?.message || 'ไม่สามารถตรวจสอบคูปองได้');
          this.cdr.detectChanges();
        }
      });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.notificationService.info('ยกเลิกการใช้คูปอง');
    this.cdr.detectChanges();
  }

  // Order Submission
  submitOrder(): void {
    if (this.checkoutForm.invalid) {
      this.notificationService.error('กรุณาตรวจสอบข้อมูลให้ครบถ้วน');
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
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
      shippingMethod: 'Standard', // Default shipping method

      // Optional
      couponCode: this.appliedCoupon ? this.couponCode : null,
      customerNotes: payment.customerNotes || null
    };

    this.isSubmitting = true;

    this.orderService.createOrder(orderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.isSubmitting = false;
          this.notificationService.success('สั่งซื้อสินค้าสำเร็จ');

          // Clear cart
          this.cartService.clearCart().subscribe();

          // Navigate to order confirmation
          this.router.navigate(['/order-confirmation', order.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating order:', error);
          this.notificationService.error(
            error.error?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง'
          );
        }
      });
  }

  // Calculations
  getSubtotal(): number {
    return this.cart?.subtotal || 0;
  }

  getDiscountAmount(): number {
    return this.appliedCoupon?.discountAmount || 0;
  }

  getShippingFee(): number {
    return this.shippingFee;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    return subtotal - discount + shipping;
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
