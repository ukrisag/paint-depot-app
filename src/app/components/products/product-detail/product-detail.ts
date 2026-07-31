import { Component, OnInit, ChangeDetectionStrategy, PLATFORM_ID, Inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { Product, ProductVariant, ProductImage } from '../../../models/product.model';
import { ReviewDto } from '../../../services/openapi-client/model/models';
import { ReviewCardComponent } from '../../reviews/review-card/review-card.component';
import { ReviewFormComponent } from '../../reviews/review-form/review-form.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, ReviewCardComponent, ReviewFormComponent, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  selectedVariant = signal<ProductVariant | null>(null);
  selectedImageId = signal<number | null>(null);
  quantity = signal(1);
  loading = signal(true);
  reviews = signal<ReviewDto[]>([]);
  loadingReviews = signal(false);
  showReviewForm = signal(false);
  activeTab = signal<'description' | 'specs' | 'features'>('description');

  // For template access to Math
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private reviewService: ReviewService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProduct(slug);
    }
  }

  loadProduct(slug: string) {
    this.productService.getProductBySlug(slug).subscribe(product => {
      this.product.set(product || null);
      const prod = this.product();
      if (prod?.variants && prod.variants.length > 0) {
        this.selectedVariant.set(prod.variants[0]);
      }
      if (prod?.images && prod.images.length > 0) {
        this.selectedImageId.set(prod.images.find(img => img.isPrimary)?.id || prod.images[0].id);
      }
      this.loading.set(false);

      // Load reviews after product is loaded
      if (prod?.id) {
        this.loadReviews(prod.id);
      }
    });
  }

  loadReviews(productId: number) {
    this.loadingReviews.set(true);
    this.reviewService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.loadingReviews.set(false);
      }
    });
  }

  selectVariant(variant: ProductVariant) {
    if (variant.stockQuantity <= 0) return;
    this.selectedVariant.set(variant);
  }

  selectImage(image: ProductImage) {
    this.selectedImageId.set(image.id);
  }

  getSelectedImage(): string {
    const prod = this.product();
    if (!prod?.images || prod.images.length === 0) {
      return 'https://via.placeholder.com/600x600';
    }

    const selectedImage = prod.images.find(img => img.id === this.selectedImageId());
    return selectedImage?.imageUrl || prod.images[0].imageUrl;
  }

  addToCart() {
    const variant = this.selectedVariant();
    if (!variant) {
      return;
    }

    // Check if out of stock
    if (variant.stockQuantity <= 0) {
      this.notificationService.error('สินค้าหมด ไม่สามารถเพิ่มลงตะกร้าได้');
      return;
    }

    // Check if requested quantity exceeds available stock
    if (this.quantity() > variant.stockQuantity) {
      this.notificationService.error(`สินค้าคงเหลือเพียง ${variant.stockQuantity} ชิ้น`);
      return;
    }

    this.cartService.addToCart({
      productVariantId: variant.id,
      quantity: this.quantity()
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

  isOutOfStock(): boolean {
    const variant = this.selectedVariant();
    return !variant || variant.stockQuantity <= 0;
  }

  isLowStock(): boolean {
    const variant = this.selectedVariant();
    if (!variant) {
      return false;
    }
    const threshold = variant.lowStockThreshold || 5;
    return variant.stockQuantity > 0 && variant.stockQuantity <= threshold;
  }

  getMaxQuantity(): number {
    return this.selectedVariant()?.stockQuantity || 0;
  }

  incrementQuantity() {
    if (this.quantity() < this.getMaxQuantity()) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  getPrimaryImage(): string {
    const prod = this.product();
    const primaryImage = prod?.images?.find(img => img.isPrimary);
    return primaryImage?.imageUrl || prod?.images?.[0]?.imageUrl || 'https://via.placeholder.com/600x600';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  getAverageRating(): number {
    const reviewList = this.reviews();
    if (!reviewList || reviewList.length === 0) return 0;

    const approvedReviews = reviewList.filter(r => r.status?.toLowerCase() === 'approved');
    if (approvedReviews.length === 0) return 0;

    const sum = approvedReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round((sum / approvedReviews.length) * 10) / 10;
  }

  getApprovedReviews(): ReviewDto[] {
    return this.reviews().filter(r => r.status?.toLowerCase() === 'approved');
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  getSpecsArray(): Array<{ key: string; value: any }> {
    const prod = this.product();
    if (!prod?.specifications) return [];

    return Object.entries(prod.specifications).map(([key, value]) => ({
      key,
      value
    }));
  }

  openReviewForm() {
    if (!this.isAuthenticated) {
      this.notificationService.error('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว');
      return;
    }
    this.showReviewForm.set(true);
  }

  closeReviewForm() {
    this.showReviewForm.set(false);
  }

  onReviewSubmitted() {
    this.showReviewForm.set(false);
    const prod = this.product();
    if (prod?.id) {
      this.loadReviews(prod.id);
    }
  }

  shareProduct() {
    const prod = this.product();
    if (!prod) return;

    const url = window.location.href;
    const title = prod.name;
    const text = prod.shortDescription || title;

    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).then(() => {
        this.notificationService.success('แชร์สินค้าเรียบร้อยแล้ว');
      }).catch((error) => {
        console.error('Error sharing:', error);
        this.fallbackShare(url);
      });
    } else {
      // Fallback: Copy to clipboard
      this.fallbackShare(url);
    }
  }

  private fallbackShare(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.notificationService.success('คัดลอกลิงก์สินค้าเรียบร้อยแล้ว');
      }).catch(() => {
        this.notificationService.error('ไม่สามารถคัดลอกลิงก์ได้');
      });
    } else {
      this.notificationService.info('กรุณาคัดลอกลิงก์จาก URL ด้านบน');
    }
  }

  contactUs() {
    const prod = this.product();
    const subject = prod ? `สอบถามเกี่ยวกับสินค้า: ${prod.name}` : 'สอบถามเกี่ยวกับสินค้า';
    const body = prod ? `สวัสดีครับ/ค่ะ\n\nต้องการสอบถามเกี่ยวกับสินค้า: ${prod.name}\nลิงก์: ${window.location.href}\n\n` : '';

    // Open email client
    window.location.href = `mailto:support@paintdepot.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}
