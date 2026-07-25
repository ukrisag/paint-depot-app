import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product.model';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { WishlistService } from '../../../services/wishlist.service';
import { AuthService } from '../../../services/auth.service';
import { ImageFallbackDirective } from '../../../directives/image-fallback.directive';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, ImageFallbackDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent {
  @Input() product!: Product;
  isWishlistLoading = false;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Add first variant to cart
    if (this.product.variants && this.product.variants.length > 0) {
      const firstVariant = this.product.variants[0];

      // Check stock before adding
      if (firstVariant.stockQuantity <= 0) {
        this.notificationService.error('สินค้าหมด ไม่สามารถเพิ่มลงตะกร้าได้');
        return;
      }

      this.cartService.addToCart({
        productVariantId: firstVariant.id,
        quantity: 1,
      }).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มสินค้าเข้าตะกร้าแล้ว!');
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'ไม่สามารถเพิ่มสินค้าได้';
          this.notificationService.error(errorMessage);
        }
      });
    }
  }

  isOutOfStock(): boolean {
    // If no variants data, assume product is available (not out of stock)
    if (!this.product.variants || this.product.variants.length === 0) {
      return false;
    }
    // Check if all variants are out of stock
    return this.product.variants.every(v => v.stockQuantity <= 0);
  }

  getTotalStock(): number {
    if (!this.product.variants || this.product.variants.length === 0) {
      return 0;
    }
    return this.product.variants.reduce((total, v) => total + v.stockQuantity, 0);
  }

  hasVariantData(): boolean {
    return !!(this.product.variants && this.product.variants.length > 0);
  }

  getPrimaryImage(): string {
    const primaryImage = this.product.images?.find(img => img.isPrimary);
    return primaryImage?.imageUrl || this.product.images?.[0]?.imageUrl || 'https://placehold.co/400x400/e5e7eb/6b7280/png?text=No+Image';
  }

  getLowestPrice(): number {
    if (!this.product.variants || this.product.variants.length === 0) {
      return this.product.basePrice;
    }
    return Math.min(...this.product.variants.map(v => v.price));
  }

  toggleWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Check if user is authenticated
    if (!this.authService.isAuthenticated) {
      this.notificationService.error('กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าในรายการโปรด');
      return;
    }

    // Prevent multiple clicks while loading
    if (this.isWishlistLoading) {
      return;
    }

    this.isWishlistLoading = true;
    this.cdr.detectChanges();

    // Check if product is already in wishlist
    const currentlyInWishlist = this.isInWishlist();

    if (currentlyInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.notificationService.success('ลบสินค้าออกจากรายการโปรดแล้ว');
          this.isWishlistLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error removing from wishlist', error);
          this.notificationService.error('เกิดข้อผิดพลาดในการลบสินค้า');
          this.isWishlistLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มสินค้าในรายการโปรดแล้ว');
          this.isWishlistLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error adding to wishlist', error);

          // Check if error is "already in wishlist"
          const errorMessage = error?.error?.message || error?.message || '';
          if (errorMessage.toLowerCase().includes('already in wishlist')) {
            // Silently reload wishlist to sync state, don't show error
            this.wishlistService.loadWishlist();
          } else {
            this.notificationService.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
          }

          this.isWishlistLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }
}
