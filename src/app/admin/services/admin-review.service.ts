import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewsService } from '../../services/openapi-client/api/reviews.service';
import { AdminReviewsService } from '../../services/openapi-client/api/adminReviews.service';
import { ReviewDto } from '../../services/openapi-client/model/reviewDto';
import { ApproveReviewDto } from '../../services/openapi-client/model/approveReviewDto';
import { UpdateReviewDto } from '../../services/openapi-client/model/updateReviewDto';

@Injectable({
  providedIn: 'root'
})
export class AdminReviewService {

  constructor(
    private reviewsService: ReviewsService,
    private adminReviewsService: AdminReviewsService
  ) {}

  /**
   * Get reviews for a specific product
   */
  getProductReviews(productId: number): Observable<ReviewDto[]> {
    return this.reviewsService.apiProductsProductIdReviewsGet(productId).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get all reviews across all products (Admin)
   */
  getAllReviews(status?: string, rating?: number, pageNumber: number = 1, pageSize: number = 100): Observable<ReviewDto[]> {
    return this.adminReviewsService.apiAdminReviewsGet(status, rating, pageNumber, pageSize).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get review by ID
   * Note: There's no dedicated endpoint for this, so we'd need to fetch from product
   */
  getReviewById(reviewId: number): Observable<ReviewDto | undefined> {
    // Placeholder - would need dedicated endpoint
    return new Observable(observer => {
      observer.next(undefined);
      observer.complete();
    });
  }

  /**
   * Approve review
   */
  approveReview(id: number, adminResponse?: string): Observable<ReviewDto | undefined> {
    const approveDto: ApproveReviewDto = {
      adminResponse: adminResponse || null
    };

    return this.reviewsService.apiReviewsIdApprovePut(id, approveDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Reject review (Admin)
   */
  rejectReview(id: number): Observable<ReviewDto | undefined> {
    return this.adminReviewsService.apiAdminReviewsIdRejectPut(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete review
   */
  deleteReview(id: number): Observable<any> {
    return this.reviewsService.apiReviewsIdDelete(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update review (for admin response)
   */
  updateReview(id: number, updateDto: UpdateReviewDto): Observable<ReviewDto | undefined> {
    return this.reviewsService.apiReviewsIdPut(id, updateDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add admin response to review
   */
  addAdminResponse(id: number, response: string): Observable<ReviewDto | undefined> {
    return this.approveReview(id, response);
  }
}
