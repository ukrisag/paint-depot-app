import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WishlistService } from '../../../services/wishlist.service';
import { NotificationService } from '../../../services/notification.service';
import { WishlistDto } from '../../../services/openapi-client/model/models';
import { ImageFallbackDirective } from '../../../directives/image-fallback.directive';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageFallbackDirective],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: WishlistDto[] = [];
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
    this.subscribeToWishlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToWishlist(): void {
    this.wishlistService.wishlistItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.wishlistItems = items;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error subscribing to wishlist', error);
          this.error = 'เกิดข้อผิดพลาดในการโหลดรายการโปรด';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.wishlistService.loadWishlist();
  }

  removeFromWishlist(productId: number | undefined, productName: string | null | undefined): void {
    if (!productId) {
      this.notificationService.error('ไม่สามารถลบสินค้าได้');
      return;
    }

    this.notificationService.confirm(
      `คุณต้องการลบ "${productName || 'สินค้า'}" ออกจากรายการโปรดหรือไม่?`,
      () => {
        this.wishlistService.removeFromWishlist(productId).subscribe({
          next: () => {
            this.notificationService.success('ลบสินค้าออกจากรายการโปรดเรียบร้อยแล้ว');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error removing from wishlist', error);
            this.notificationService.error('เกิดข้อผิดพลาดในการลบสินค้า');
            this.cdr.detectChanges();
          }
        });
      }
    );
  }

  navigateToProduct(slug: string | null | undefined): void {
    if (slug) {
      this.router.navigate(['/products', slug]);
    }
  }

  getImageUrl(image: string | null | undefined): string {
    return image || 'https://placehold.co/400x400/e5e7eb/6b7280/png?text=No+Image';
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return '0';
    return price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
