import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string = '/';
  showPassword = false;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Load wishlist and cart after successful login
        this.wishlistService.loadWishlist();
        this.cartService.loadCart();

        this.notificationService.success('เข้าสู่ระบบสำเร็จ');
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error?.error?.message || error?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        this.notificationService.error(errorMessage);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  loginWithGoogle() {
    this.notificationService.info('การเข้าสู่ระบบด้วย Google จะเปิดใช้งานในอนาคต');
    // TODO: Implement Google OAuth integration
    // window.location.href = `${environment.apiUrl}/auth/google`;
  }

  loginWithFacebook() {
    this.notificationService.info('การเข้าสู่ระบบด้วย Facebook จะเปิดใช้งานในอนาคต');
    // TODO: Implement Facebook OAuth integration
    // window.location.href = `${environment.apiUrl}/auth/facebook`;
  }
}
