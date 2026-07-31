import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminCouponService } from '../../services/admin-coupon.service';
import { NotificationService } from '../../../services/notification.service';
import { CouponDto } from '../../../services/openapi-client/model/couponDto';
import { CreateCouponDto } from '../../../services/openapi-client/model/createCouponDto';

@Component({
  selector: 'app-coupon-form-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coupon-form-admin.component.html',
  styleUrls: ['./coupon-form-admin.component.css']
})
export class CouponFormAdminComponent implements OnInit {
  couponForm!: FormGroup;

  isEditMode = signal(false);
  couponId = signal<number | undefined>(undefined);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private adminCouponService: AdminCouponService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.couponId.set(parseInt(id, 10));
    }

    if (this.isEditMode() && this.couponId()) {
      this.loadCoupon(this.couponId()!);
    } else {
      this.loading.set(false);
    }
  }

  initializeForm(): void {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['Percentage', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      minPurchaseAmount: [null, Validators.min(0)],
      maxDiscountAmount: [null, Validators.min(0)],
      usageLimitTotal: [null, Validators.min(1)],
      usageLimitPerUser: [null, Validators.min(1)],
      validFrom: [null],
      validUntil: [null],
      isActive: [true]
    });

    // Watch for type changes to update validation
    this.couponForm.get('type')?.valueChanges.subscribe(() => {
      this.updateValidation();
    });
  }

  updateValidation(): void {
    const type = this.couponForm.get('type')?.value;
    const valueControl = this.couponForm.get('value');

    if (type === 'Percentage') {
      // Percentage should be between 0 and 100
      valueControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else {
      // Fixed amount should be at least 0
      valueControl?.setValidators([Validators.required, Validators.min(0)]);
    }

    valueControl?.updateValueAndValidity();
  }

  loadCoupon(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.adminCouponService.getCouponById(id).subscribe({
      next: (coupon) => {
        if (coupon) {
          this.populateForm(coupon);
        } else {
          this.error.set('ไม่พบคูปอง');
          this.notificationService.error('ไม่พบคูปอง');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลคูปองได้');
        this.notificationService.error('ไม่สามารถโหลดข้อมูลคูปองได้');
        this.loading.set(false);
        console.error('Error loading coupon:', err);
      }
    });
  }

  populateForm(coupon: CouponDto): void {
    this.couponForm.patchValue({
      code: coupon.code,
      type: coupon.type || 'Percentage',
      value: coupon.value,
      minPurchaseAmount: coupon.minPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimitTotal: coupon.usageLimitTotal,
      usageLimitPerUser: coupon.usageLimitPerUser,
      validFrom: this.formatDateForInput(coupon.validFrom),
      validUntil: this.formatDateForInput(coupon.validUntil),
      isActive: coupon.isActive
    });

    // Mark form as pristine after loading data to prevent immediate validation
    this.couponForm.markAsPristine();
    this.couponForm.markAsUntouched();

    // Debug: log form status
    console.log('Coupon form populated with:', this.couponForm.value);
    console.log('Coupon form valid:', this.couponForm.valid);
    console.log('Coupon form errors:', this.getFormValidationErrors());
  }

  // Helper method to debug form validation errors
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.couponForm.controls).forEach(key => {
      const control = this.couponForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  formatDateForInput(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched(this.couponForm);
      this.notificationService.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // Validate dates
    const validFrom = this.couponForm.get('validFrom')?.value;
    const validUntil = this.couponForm.get('validUntil')?.value;

    if (validFrom && validUntil && new Date(validFrom) > new Date(validUntil)) {
      this.notificationService.error('วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด');
      return;
    }

    this.submitting.set(true);
    const formValue = this.couponForm.value;

    // Convert code to uppercase
    const couponData: CreateCouponDto = {
      code: formValue.code.toUpperCase(),
      type: formValue.type,
      value: parseFloat(formValue.value),
      minPurchaseAmount: formValue.minPurchaseAmount ? parseFloat(formValue.minPurchaseAmount) : null,
      maxDiscountAmount: formValue.maxDiscountAmount ? parseFloat(formValue.maxDiscountAmount) : null,
      usageLimitTotal: formValue.usageLimitTotal ? parseInt(formValue.usageLimitTotal, 10) : null,
      usageLimitPerUser: formValue.usageLimitPerUser ? parseInt(formValue.usageLimitPerUser, 10) : null,
      validFrom: formValue.validFrom ? new Date(formValue.validFrom).toISOString() : null,
      validUntil: formValue.validUntil ? new Date(formValue.validUntil).toISOString() : null,
      isActive: formValue.isActive
    };

    if (this.isEditMode() && this.couponId()) {
      // Update coupon
      this.adminCouponService.updateCoupon(this.couponId()!, couponData).subscribe({
        next: () => {
          this.notificationService.success('บันทึกข้อมูลคูปองเรียบร้อยแล้ว');
          this.router.navigate(['/admin/coupons']);
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถบันทึกข้อมูลคูปองได้');
          this.submitting.set(false);
          console.error('Error updating coupon:', err);
        }
      });
    } else {
      // Create coupon
      this.adminCouponService.createCoupon(couponData).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มคูปองเรียบร้อยแล้ว');
          this.router.navigate(['/admin/coupons']);
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถเพิ่มคูปองได้');
          this.submitting.set(false);
          console.error('Error creating coupon:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/coupons']);
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.couponForm.patchValue({ code: input.value });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.couponForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.couponForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['maxLength']) return `ความยาวสูงสุด ${field.errors['maxLength'].requiredLength} ตัวอักษร`;
    if (field.errors['min']) return `ค่าต่ำสุดคือ ${field.errors['min'].min}`;
    if (field.errors['max']) return `ค่าสูงสุดคือ ${field.errors['max'].max}`;

    return 'ข้อมูลไม่ถูกต้อง';
  }
}
