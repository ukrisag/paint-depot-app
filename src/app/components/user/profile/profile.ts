import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { WishlistComponent } from '../../wishlist/wishlist/wishlist.component';
import { OrderListComponent } from '../../orders/order-list/order-list.component';

type TabType = 'account' | 'orders' | 'wishlist' | 'password';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    WishlistComponent,
    OrderListComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab: TabType = 'account';
  accountForm!: FormGroup;
  passwordForm!: FormGroup;
  isLoadingAccount = false;
  isLoadingPassword = false;
  isMobileMenuOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Account Info Form
    this.accountForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });

    // Change Password Form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private loadUserData(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.accountForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSubmitAccount(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched(this.accountForm);
      return;
    }

    this.isLoadingAccount = true;
    const formData = this.accountForm.getRawValue();

    // Since we don't have a user update endpoint in the AuthService yet,
    // we'll show a notification that this feature is coming soon
    setTimeout(() => {
      this.isLoadingAccount = false;
      this.notificationService.info('ฟีเจอร์นี้กำลังพัฒนา กรุณารอการอัปเดต');
    }, 500);

    // TODO: Implement user profile update API call
    // Example:
    // this.authService.updateProfile(formData).subscribe({
    //   next: () => {
    //     this.notificationService.success('อัปเดตข้อมูลสำเร็จ');
    //     this.isLoadingAccount = false;
    //   },
    //   error: (error) => {
    //     this.notificationService.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    //     this.isLoadingAccount = false;
    //   }
    // });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoadingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    // Since we don't have a password change endpoint in the AuthService yet,
    // we'll show a notification that this feature is coming soon
    setTimeout(() => {
      this.isLoadingPassword = false;
      this.passwordForm.reset();
      this.notificationService.info('ฟีเจอร์นี้กำลังพัฒนา กรุณารอการอัปเดต');
    }, 500);

    // TODO: Implement password change API call
    // Example:
    // this.authService.changePassword(currentPassword, newPassword).subscribe({
    //   next: () => {
    //     this.notificationService.success('เปลี่ยนรหัสผ่านสำเร็จ');
    //     this.passwordForm.reset();
    //     this.isLoadingPassword = false;
    //   },
    //   error: (error) => {
    //     this.notificationService.error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    //     this.isLoadingPassword = false;
    //   }
    // });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'กรุณากรอกข้อมูลนี้';
    }

    if (control.errors['minlength']) {
      return `ต้องมีอย่างน้อย ${control.errors['minlength'].requiredLength} ตัวอักษร`;
    }

    if (control.errors['pattern']) {
      return 'รูปแบบไม่ถูกต้อง กรุณากรอกเบอร์โทร 10 หลัก';
    }

    return '';
  }

  getPasswordFormError(): string {
    if (this.passwordForm.errors?.['passwordMismatch'] &&
        this.passwordForm.get('confirmPassword')?.touched) {
      return 'รหัสผ่านไม่ตรงกัน';
    }
    return '';
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  logout(): void {
    this.notificationService.confirm(
      'คุณต้องการออกจากระบบหรือไม่?',
      () => {
        this.authService.logout();
        this.router.navigate(['/']);
        this.notificationService.success('ออกจากระบบสำเร็จ');
      }
    );
  }
}
