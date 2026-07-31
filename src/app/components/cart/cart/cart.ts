import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { Cart, CartItem } from '../../../models/cart.model';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit, OnDestroy {
  cart = signal<Cart | null>(null);
  private subscription?: Subscription;

  constructor(
    public cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.subscription = this.cartService.cart$.subscribe(cart => {
      this.cart.set(cart);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  updateQuantity(item: CartItem, quantity: number) {
    this.cartService.updateCartItem(item.id, quantity).subscribe();
  }

  removeItem(item: CartItem) {
    this.notificationService.confirm(
      'ต้องการลบสินค้านี้ออกจากตะกร้า?',
      () => {
        this.cartService.removeCartItem(item.id).subscribe(() => {
          this.notificationService.success('ลบสินค้าออกจากตะกร้าแล้ว!');
        });
      }
    );
  }
}
