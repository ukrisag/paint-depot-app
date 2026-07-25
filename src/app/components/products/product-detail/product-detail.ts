import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { Product, ProductVariant } from '../../../models/product.model';
import { ReviewDto } from '../../../services/openapi-client/model/models';
import { ReviewCardComponent } from '../../reviews/review-card/review-card.component';
import { ReviewFormComponent } from '../../reviews/review-form/review-form.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, ReviewCardComponent, ReviewFormComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedVariant: ProductVariant | null = null;
  quantity = 1;
  loading = true;
  reviews: ReviewDto[] = [];
  loadingReviews = false;
  showReviewForm = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProduct(slug);
    }
  }

  loadProduct(slug: string) {
    this.productService.getProductBySlug(slug).subscribe(product => {
      this.product = product || null;
      if (this.product?.variants && this.product.variants.length > 0) {
        this.selectedVariant = this.product.variants[0];
      }
      this.loading = false;
      this.cdr.detectChanges();

      // Load reviews after product is loaded
      if (this.product?.id) {
        this.loadReviews(this.product.id);
      }
    });
  }

  loadReviews(productId: number) {
    this.loadingReviews = true;
    this.reviewService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loadingReviews = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviews = [];
        this.loadingReviews = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariant = variant;
  }

  addToCart() {
    if (!this.selectedVariant) {
      return;
    }

    // Check if out of stock
    if (this.selectedVariant.stockQuantity <= 0) {
      this.notificationService.error('สินค้าหมด ไม่สามารถเพิ่มลงตะกร้าได้');
      return;
    }

    // Check if requested quantity exceeds available stock
    if (this.quantity > this.selectedVariant.stockQuantity) {
      this.notificationService.error(`สินค้าคงเหลือเพียง ${this.selectedVariant.stockQuantity} ชิ้น`);
      return;
    }

    this.cartService.addToCart({
      productVariantId: this.selectedVariant.id,
      quantity: this.quantity
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
    return !this.selectedVariant || this.selectedVariant.stockQuantity <= 0;
  }

  isLowStock(): boolean {
    if (!this.selectedVariant) {
      return false;
    }
    const threshold = this.selectedVariant.lowStockThreshold || 5;
    return this.selectedVariant.stockQuantity > 0
      && this.selectedVariant.stockQuantity <= threshold;
  }

  getMaxQuantity(): number {
    return this.selectedVariant?.stockQuantity || 0;
  }

  incrementQuantity() {
    if (this.quantity < this.getMaxQuantity()) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getPrimaryImage(): string {
    const primaryImage = this.product?.images?.find(img => img.isPrimary);
    return primaryImage?.imageUrl || this.product?.images?.[0]?.imageUrl || 'https://via.placeholder.com/600x600';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;

    const approvedReviews = this.reviews.filter(r => r.status?.toLowerCase() === 'approved');
    if (approvedReviews.length === 0) return 0;

    const sum = approvedReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round((sum / approvedReviews.length) * 10) / 10;
  }

  getApprovedReviews(): ReviewDto[] {
    return this.reviews.filter(r => r.status?.toLowerCase() === 'approved');
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  openReviewForm() {
    if (!this.isAuthenticated) {
      this.notificationService.error('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว');
      return;
    }
    this.showReviewForm = true;
  }

  closeReviewForm() {
    this.showReviewForm = false;
    this.cdr.detectChanges();
  }

  onReviewSubmitted() {
    this.showReviewForm = false;
    this.cdr.detectChanges();
    if (this.product?.id) {
      this.loadReviews(this.product.id);
    }
  }
}
