import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/layout/header/header';
import { FooterComponent } from './components/layout/footer/footer';
import { ToastComponent } from './components/shared/toast/toast';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { WishlistService } from './services/wishlist.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'ร้านสี - สีคุณภาพสำหรับทุกโปรเจกต์';
  isAdminRoute = false;

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {
    // Check if current route is admin
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminRoute = event.url.startsWith('/admin');
      });
  }

  ngOnInit(): void {
    // Check initial route
    this.isAdminRoute = this.router.url.startsWith('/admin');

    // Load wishlist and cart if user is authenticated
    if (this.authService.isAuthenticated) {
      this.wishlistService.loadWishlist();
      this.cartService.loadCart();
    }
  }
}
