# Mock Data for Testing

If you want to test the component before implementing the backend API, you can use this mock data.

## Temporary Mock Service Implementation

Update `admin-review.service.ts` temporarily with:

```typescript
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ReviewDto } from '../../services/openapi-client/model/reviewDto';

@Injectable({
  providedIn: 'root'
})
export class AdminReviewService {

  // Mock data
  private mockReviews: ReviewDto[] = [
    {
      id: 1,
      productId: 101,
      userId: 201,
      userName: 'John Doe',
      rating: 5,
      title: 'Excellent paint quality!',
      comment: 'This paint exceeded my expectations. The coverage is amazing and the color is exactly as shown. Would definitely buy again!',
      isVerifiedPurchase: true,
      helpfulCount: 12,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      productId: 102,
      userId: 202,
      userName: 'Jane Smith',
      rating: 4,
      title: 'Good paint, minor issues',
      comment: 'The paint quality is good overall, but I found it a bit difficult to apply evenly. Needed two coats for proper coverage.',
      isVerifiedPurchase: true,
      helpfulCount: 5,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-01-20T14:15:00Z',
      updatedAt: '2024-01-20T14:15:00Z'
    },
    {
      id: 3,
      productId: 103,
      userId: 203,
      userName: 'Bob Johnson',
      rating: 1,
      title: 'Terrible quality',
      comment: 'This is the worst paint I have ever used. It clumps, has poor coverage, and the color is nothing like advertised.',
      isVerifiedPurchase: false,
      helpfulCount: 0,
      status: 'rejected',
      adminResponse: 'We are sorry to hear about your experience. Please contact our customer service.',
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-18T16:30:00Z'
    },
    {
      id: 4,
      productId: 104,
      userId: 204,
      userName: 'Alice Williams',
      rating: 5,
      title: 'Perfect for my living room',
      comment: 'Love the finish! Easy to apply and looks professional. The matte finish hides all the wall imperfections.',
      isVerifiedPurchase: true,
      helpfulCount: 8,
      status: 'approved',
      adminResponse: 'Thank you for your wonderful feedback!',
      createdAt: '2024-01-22T11:45:00Z',
      updatedAt: '2024-01-22T11:45:00Z'
    },
    {
      id: 5,
      productId: 105,
      userId: 205,
      userName: 'Charlie Brown',
      rating: 3,
      title: 'Average paint',
      comment: 'Nothing special about this paint. Does the job but there are better options for the same price.',
      isVerifiedPurchase: true,
      helpfulCount: 2,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-01-25T08:20:00Z',
      updatedAt: '2024-01-25T08:20:00Z'
    },
    {
      id: 6,
      productId: 101,
      userId: 206,
      userName: 'Diana Prince',
      rating: 5,
      title: 'Best paint ever!',
      comment: 'I have tried many brands but this one is by far the best. Smooth application, great coverage, and beautiful finish.',
      isVerifiedPurchase: true,
      helpfulCount: 15,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-01-26T13:30:00Z',
      updatedAt: '2024-01-26T13:30:00Z'
    },
    {
      id: 7,
      productId: 106,
      userId: 207,
      userName: 'Edward Norton',
      rating: 2,
      title: 'Not worth the price',
      comment: 'Expected better quality for this price point. The coverage is poor and needed 3-4 coats.',
      isVerifiedPurchase: false,
      helpfulCount: 1,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-01-28T15:10:00Z',
      updatedAt: '2024-01-28T15:10:00Z'
    },
    {
      id: 8,
      productId: 107,
      userId: 208,
      userName: 'Fiona Green',
      rating: 4,
      title: 'Good for the money',
      comment: 'Decent paint for the price. Not the best I have used but definitely not the worst. Good value.',
      isVerifiedPurchase: true,
      helpfulCount: 6,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-01-29T10:00:00Z',
      updatedAt: '2024-01-29T10:00:00Z'
    },
    {
      id: 9,
      productId: 108,
      userId: 209,
      userName: 'George Miller',
      rating: 5,
      title: 'Highly recommend',
      comment: 'Professional quality paint at a reasonable price. Easy to work with and the results are fantastic.',
      isVerifiedPurchase: true,
      helpfulCount: 20,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-01-30T12:25:00Z',
      updatedAt: '2024-01-30T12:25:00Z'
    },
    {
      id: 10,
      productId: 109,
      userId: 210,
      userName: 'Hannah Lee',
      rating: 3,
      title: 'Okay paint',
      comment: 'It is okay. Nothing to complain about but nothing to rave about either. Average in every way.',
      isVerifiedPurchase: true,
      helpfulCount: 3,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z'
    },
    {
      id: 11,
      productId: 110,
      userId: 211,
      userName: 'Ivan Rodriguez',
      rating: 4,
      title: 'Great color selection',
      comment: 'The color options are excellent and the paint quality is good. Very satisfied with my purchase.',
      isVerifiedPurchase: true,
      helpfulCount: 7,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-02T14:40:00Z',
      updatedAt: '2024-02-02T14:40:00Z'
    },
    {
      id: 12,
      productId: 111,
      userId: 212,
      userName: 'Julia Martinez',
      rating: 5,
      title: 'Perfect finish',
      comment: 'The finish is absolutely perfect. Looks like it was done by a professional painter. Highly recommended!',
      isVerifiedPurchase: true,
      helpfulCount: 18,
      status: 'approved',
      adminResponse: 'We appreciate your kind words!',
      createdAt: '2024-02-03T11:20:00Z',
      updatedAt: '2024-02-03T11:20:00Z'
    },
    {
      id: 13,
      productId: 102,
      userId: 213,
      userName: 'Kevin Davis',
      rating: 2,
      title: 'Disappointed',
      comment: 'I was expecting much better based on the reviews. The paint is thin and requires many coats.',
      isVerifiedPurchase: false,
      helpfulCount: 0,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-04T16:55:00Z',
      updatedAt: '2024-02-04T16:55:00Z'
    },
    {
      id: 14,
      productId: 112,
      userId: 214,
      userName: 'Linda Wilson',
      rating: 5,
      title: 'Excellent product',
      comment: 'Top quality paint. Easy application, great coverage, beautiful color. Cannot ask for more!',
      isVerifiedPurchase: true,
      helpfulCount: 14,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-05T10:10:00Z',
      updatedAt: '2024-02-05T10:10:00Z'
    },
    {
      id: 15,
      productId: 113,
      userId: 215,
      userName: 'Michael Taylor',
      rating: 4,
      title: 'Very good paint',
      comment: 'Great paint overall. The only minor issue is the drying time is a bit longer than expected.',
      isVerifiedPurchase: true,
      helpfulCount: 9,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-06T13:35:00Z',
      updatedAt: '2024-02-06T13:35:00Z'
    },
    {
      id: 16,
      productId: 114,
      userId: 216,
      userName: 'Nancy Anderson',
      rating: 1,
      title: 'Do not buy',
      comment: 'Worst purchase ever. Paint started peeling off after just a week. Complete waste of money.',
      isVerifiedPurchase: false,
      helpfulCount: 2,
      status: 'rejected',
      adminResponse: 'We would like to investigate this issue. Please contact our support team.',
      createdAt: '2024-02-07T09:45:00Z',
      updatedAt: '2024-02-07T15:20:00Z'
    },
    {
      id: 17,
      productId: 115,
      userId: 217,
      userName: 'Oliver Thomas',
      rating: 5,
      title: 'Amazing quality',
      comment: 'This paint is amazing! Professional grade quality at a consumer price. Will be buying more.',
      isVerifiedPurchase: true,
      helpfulCount: 22,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-08T11:00:00Z',
      updatedAt: '2024-02-08T11:00:00Z'
    },
    {
      id: 18,
      productId: 116,
      userId: 218,
      userName: 'Patricia Jackson',
      rating: 3,
      title: 'Decent but not great',
      comment: 'The paint is decent for DIY projects but I would not use it for anything professional.',
      isVerifiedPurchase: true,
      helpfulCount: 4,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-09T14:15:00Z',
      updatedAt: '2024-02-09T14:15:00Z'
    },
    {
      id: 19,
      productId: 117,
      userId: 219,
      userName: 'Quincy White',
      rating: 4,
      title: 'Good quality paint',
      comment: 'The quality is good and the price is fair. I am happy with my purchase and the results.',
      isVerifiedPurchase: true,
      helpfulCount: 10,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-10T10:30:00Z',
      updatedAt: '2024-02-10T10:30:00Z'
    },
    {
      id: 20,
      productId: 118,
      userId: 220,
      userName: 'Rachel Harris',
      rating: 5,
      title: 'Love it!',
      comment: 'Absolutely love this paint! The color is vibrant, coverage is excellent, and it was easy to apply.',
      isVerifiedPurchase: true,
      helpfulCount: 16,
      status: 'approved',
      adminResponse: 'Thank you for choosing our products!',
      createdAt: '2024-02-11T12:45:00Z',
      updatedAt: '2024-02-11T12:45:00Z'
    },
    {
      id: 21,
      productId: 119,
      userId: 221,
      userName: 'Samuel Martin',
      rating: 2,
      title: 'Not satisfied',
      comment: 'The paint is too thin and requires too many coats. Not satisfied with the quality.',
      isVerifiedPurchase: false,
      helpfulCount: 1,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-12T09:20:00Z',
      updatedAt: '2024-02-12T09:20:00Z'
    },
    {
      id: 22,
      productId: 120,
      userId: 222,
      userName: 'Teresa Garcia',
      rating: 5,
      title: 'Fantastic paint',
      comment: 'This is fantastic paint! Excellent coverage, beautiful finish, and great value for money.',
      isVerifiedPurchase: true,
      helpfulCount: 19,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-13T15:10:00Z',
      updatedAt: '2024-02-13T15:10:00Z'
    },
    {
      id: 23,
      productId: 101,
      userId: 223,
      userName: 'Victor Clark',
      rating: 4,
      title: 'Solid choice',
      comment: 'A solid choice for interior painting. Good quality and reasonable price. Would buy again.',
      isVerifiedPurchase: true,
      helpfulCount: 11,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-14T11:35:00Z',
      updatedAt: '2024-02-14T11:35:00Z'
    },
    {
      id: 24,
      productId: 121,
      userId: 224,
      userName: 'Wendy Lewis',
      rating: 3,
      title: 'Average product',
      comment: 'Just an average product. Nothing special but it gets the job done.',
      isVerifiedPurchase: true,
      helpfulCount: 5,
      status: 'approved',
      adminResponse: null,
      createdAt: '2024-02-15T13:50:00Z',
      updatedAt: '2024-02-15T13:50:00Z'
    },
    {
      id: 25,
      productId: 122,
      userId: 225,
      userName: 'Xavier Young',
      rating: 5,
      title: 'Best paint I have used',
      comment: 'This is hands down the best paint I have ever used. Professional results every time!',
      isVerifiedPurchase: true,
      helpfulCount: 25,
      status: 'pending',
      adminResponse: null,
      createdAt: '2024-02-16T10:05:00Z',
      updatedAt: '2024-02-16T10:05:00Z'
    }
  ];

  constructor() {}

  /**
   * Get all reviews (mock)
   */
  getAllReviews(): Observable<ReviewDto[]> {
    return of([...this.mockReviews]).pipe(delay(500)); // Simulate API delay
  }

  /**
   * Get review by ID (mock)
   */
  getReviewById(id: number): Observable<ReviewDto | undefined> {
    const review = this.mockReviews.find(r => r.id === id);
    return of(review).pipe(delay(300));
  }

  /**
   * Approve review (mock)
   */
  approveReview(id: number, adminResponse?: string): Observable<ReviewDto | undefined> {
    const review = this.mockReviews.find(r => r.id === id);
    if (review) {
      review.status = 'approved';
      review.adminResponse = adminResponse || null;
      review.updatedAt = new Date().toISOString();
    }
    return of(review).pipe(delay(400));
  }

  /**
   * Reject review (mock)
   */
  rejectReview(id: number): Observable<ReviewDto | undefined> {
    const review = this.mockReviews.find(r => r.id === id);
    if (review) {
      review.status = 'rejected';
      review.updatedAt = new Date().toISOString();
    }
    return of(review).pipe(delay(400));
  }

  /**
   * Delete review (mock)
   */
  deleteReview(id: number): Observable<any> {
    const index = this.mockReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReviews.splice(index, 1);
    }
    return of({ success: true }).pipe(delay(400));
  }

  /**
   * Add admin response (mock)
   */
  addAdminResponse(id: number, response: string): Observable<ReviewDto | undefined> {
    return this.approveReview(id, response);
  }
}
```

## Mock Data Statistics

- **Total Reviews:** 25
- **Approved:** 11
- **Pending:** 11
- **Rejected:** 3
- **5-Star Reviews:** 10
- **4-Star Reviews:** 7
- **3-Star Reviews:** 4
- **2-Star Reviews:** 3
- **1-Star Reviews:** 2
- **Verified Purchases:** 21
- **Non-Verified:** 4

## Testing Scenarios

### Filter Testing
1. Filter by status: Pending (should show 11 reviews)
2. Filter by status: Approved (should show 11 reviews)
3. Filter by status: Rejected (should show 3 reviews)
4. Filter by rating: 5 stars (should show 10 reviews)
5. Filter by rating: 1 star (should show 2 reviews)
6. Search "excellent" (should show multiple matching reviews)
7. Combine filters: Pending + 5 stars + search "paint"

### Action Testing
1. Approve review #2 (Jane Smith) - should change status to approved
2. Reject review #9 (George Miller) - should change status to rejected
3. Delete review #13 (Kevin Davis) - should remove from list
4. Approve with admin response (review #7)
5. View details of review #1

### Bulk Action Testing
1. Select reviews #5, #9, #15 and bulk approve
2. Select reviews #7, #13, #21 and bulk reject
3. Select all on page (first 20) and approve
4. Deselect all

### Pagination Testing
1. Navigate to page 2 (reviews 21-25)
2. Navigate back to page 1
3. Change page size (if implemented)

### Edge Cases
1. Search with no results
2. Filter combination with no matches
3. Approve already approved review
4. Reject already rejected review
5. Delete non-existent review

## Removing Mock Data

Once backend is ready, replace the entire service content with the real implementation from INTEGRATION.md.

## Quick Test Script

Run these commands in browser console while on /admin/reviews page:

```javascript
// Test filters
document.querySelector('select[name="status"]').value = 'pending';
document.querySelector('select[name="status"]').dispatchEvent(new Event('change'));

// Test search
document.querySelector('input[type="text"]').value = 'excellent';
document.querySelector('input[type="text"]').dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

// Clear filters
document.querySelector('button:contains("Clear Filters")').click();
```

## Development Tips

1. **Add console logs** to track filter changes:
   ```typescript
   onFilterChange(): void {
     console.log('Filters:', {
       status: this.selectedStatus,
       rating: this.selectedRating,
       search: this.searchQuery
     });
     this.applyFilters();
   }
   ```

2. **Monitor state changes**:
   ```typescript
   loadReviews(): void {
     console.log('Loading reviews...');
     // ... rest of method
     console.log('Loaded reviews:', this.reviews.length);
   }
   ```

3. **Track pagination**:
   ```typescript
   onPageChange(page: number): void {
     console.log(`Navigating to page ${page}`);
     // ... rest of method
   }
   ```

## Expected Behavior with Mock Data

- Initial load shows all 25 reviews
- First page shows reviews 1-20
- Second page shows reviews 21-25
- Filters work immediately (client-side)
- Actions update local array
- No actual API calls made
- Component fully functional for UI/UX testing

## Transition to Real API

When ready to switch to real API:

1. Replace service file content
2. Update component to use server-side filtering
3. Update pagination logic if needed
4. Test with real data
5. Verify error handling
6. Check performance with large datasets

---

**Note:** This mock data is for development and testing only. Remove before production deployment.
