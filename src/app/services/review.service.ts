import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewsService } from './openapi-client/api/reviews.service';
import {
  CreateReviewDto,
  ReviewDto,
  UpdateReviewDto
} from './openapi-client/model/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private apiReviewsService: ReviewsService) {}

  getProductReviews(
    productId: number
  ): Observable<ReviewDto[]> {
    return this.apiReviewsService.apiProductsProductIdReviewsGet(productId).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to get reviews');
      })
    );
  }

  createReview(productId: number, reviewData: CreateReviewDto): Observable<ReviewDto> {
    return this.apiReviewsService.apiProductsProductIdReviewsPost(productId, reviewData).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create review');
      })
    );
  }

  updateReview(id: number, reviewData: UpdateReviewDto): Observable<ReviewDto> {
    return this.apiReviewsService.apiReviewsIdPut(id, reviewData).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update review');
      })
    );
  }

  deleteReview(id: number): Observable<void> {
    return this.apiReviewsService.apiReviewsIdDelete(id).pipe(
      map((response: any) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete review');
        }
      })
    );
  }
}
