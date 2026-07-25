import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header';
import { FooterComponent } from './components/layout/footer/footer';
import { ToastComponent } from './components/shared/toast/toast';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { WishlistService } from './services/wishlist.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'ร้านสี - สีคุณภาพสำหรับทุกโปรเจกต์';

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Load wishlist and cart if user is authenticated
    if (this.authService.isAuthenticated) {
      this.wishlistService.loadWishlist();
      this.cartService.loadCart();
    }
  }
}
