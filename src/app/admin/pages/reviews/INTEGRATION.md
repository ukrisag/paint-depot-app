# Reviews Management Component - Integration Guide

## Quick Start

Follow these steps to integrate the Reviews Management component into your admin panel.

## Step 1: Verify Files

Ensure all files are created in `/src/app/admin/pages/reviews/`:

```
reviews/
├── review-list-admin.component.ts
├── review-list-admin.component.html
├── review-list-admin.component.css
├── reviews-admin.component.ts
├── README.md
└── INTEGRATION.md
```

And service file in `/src/app/admin/services/`:
```
services/
└── admin-review.service.ts
```

## Step 2: Add Backend API Endpoint (REQUIRED)

The component requires a backend endpoint to fetch all reviews. Add this to your API:

### C# Controller Endpoint

Add to `ReviewsController.cs`:

```csharp
/// <summary>
/// Get all reviews (Admin only)
/// </summary>
[HttpGet("admin/reviews")]
[Authorize(Roles = "admin")]
public async Task<ActionResult<ApiResponseDto<PagedResultDto<ReviewDto>>>> GetAllReviews(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? status = null,
    [FromQuery] int? rating = null,
    [FromQuery] string? search = null)
{
    try
    {
        var result = await _reviewService.GetAllReviewsAsync(
            pageNumber,
            pageSize,
            status,
            rating,
            search
        );

        return Ok(new ApiResponseDto<PagedResultDto<ReviewDto>>
        {
            Success = true,
            Message = "Reviews retrieved successfully",
            Data = result
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponseDto<PagedResultDto<ReviewDto>>
        {
            Success = false,
            Message = $"Internal server error: {ex.Message}"
        });
    }
}

/// <summary>
/// Reject review (Admin only)
/// </summary>
[HttpPut("reviews/{id}/reject")]
[Authorize(Roles = "admin")]
public async Task<ActionResult<ApiResponseDto<ReviewDto>>> RejectReview(long id)
{
    try
    {
        var review = await _reviewService.RejectReviewAsync(id);

        return Ok(new ApiResponseDto<ReviewDto>
        {
            Success = true,
            Message = "Review rejected successfully",
            Data = review
        });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new ApiResponseDto<ReviewDto>
        {
            Success = false,
            Message = ex.Message
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponseDto<ReviewDto>
        {
            Success = false,
            Message = $"Internal server error: {ex.Message}"
        });
    }
}

/// <summary>
/// Get review by ID (Admin only)
/// </summary>
[HttpGet("reviews/{id}")]
[Authorize(Roles = "admin")]
public async Task<ActionResult<ApiResponseDto<ReviewDto>>> GetReviewById(long id)
{
    try
    {
        var review = await _reviewService.GetReviewByIdAsync(id);

        if (review == null)
        {
            return NotFound(new ApiResponseDto<ReviewDto>
            {
                Success = false,
                Message = "Review not found"
            });
        }

        return Ok(new ApiResponseDto<ReviewDto>
        {
            Success = true,
            Message = "Review retrieved successfully",
            Data = review
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponseDto<ReviewDto>
        {
            Success = false,
            Message = $"Internal server error: {ex.Message}"
        });
    }
}
```

### Service Implementation

Add to `IReviewService.cs`:

```csharp
Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(
    int pageNumber,
    int pageSize,
    string? status,
    int? rating,
    string? search
);

Task<ReviewDto?> GetReviewByIdAsync(long id);

Task<ReviewDto> RejectReviewAsync(long id);
```

Add to `ReviewService.cs`:

```csharp
public async Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(
    int pageNumber,
    int pageSize,
    string? status,
    int? rating,
    string? search)
{
    var query = _context.ProductReviews
        .Include(r => r.User)
        .Include(r => r.Product)
        .AsQueryable();

    // Apply filters
    if (!string.IsNullOrEmpty(status))
        query = query.Where(r => r.Status == status);

    if (rating.HasValue)
        query = query.Where(r => r.Rating == rating.Value);

    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(r =>
            (r.User.FirstName + " " + r.User.LastName).Contains(search) ||
            r.Title.Contains(search) ||
            r.Comment.Contains(search)
        );
    }

    var totalItems = await query.CountAsync();

    var reviews = await query
        .OrderByDescending(r => r.CreatedAt)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResultDto<ReviewDto>
    {
        Items = reviews.Select(MapToReviewDto).ToList(),
        TotalItems = totalItems,
        Page = pageNumber,
        PageSize = pageSize
    };
}

public async Task<ReviewDto?> GetReviewByIdAsync(long id)
{
    var review = await _context.ProductReviews
        .Include(r => r.User)
        .Include(r => r.Product)
        .FirstOrDefaultAsync(r => r.Id == id);

    return review == null ? null : MapToReviewDto(review);
}

public async Task<ReviewDto> RejectReviewAsync(long id)
{
    var review = await _context.ProductReviews
        .Include(r => r.User)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (review == null)
        throw new InvalidOperationException("Review not found");

    review.Status = "rejected";
    review.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return MapToReviewDto(review);
}
```

## Step 3: Regenerate OpenAPI Client

After adding the backend endpoints, regenerate the OpenAPI client:

```bash
# Navigate to the Angular app directory
cd /Users/noobmannn/Desktop/paint-depot/paint-depot-app

# Run OpenAPI generator (adjust command based on your setup)
npm run generate-api-client
# or
ng-openapi-gen --input http://localhost:5000/swagger/v1/swagger.json --output src/app/services/openapi-client
```

## Step 4: Update Admin Review Service

After regenerating the OpenAPI client, update the `AdminReviewService`:

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewsService } from '../../services/openapi-client/api/reviews.service';
import { AdminReviewsService } from '../../services/openapi-client/api/adminReviews.service'; // If generated
import { ReviewDto } from '../../services/openapi-client/model/reviewDto';
import { ApproveReviewDto } from '../../services/openapi-client/model/approveReviewDto';

@Injectable({
  providedIn: 'root'
})
export class AdminReviewService {

  constructor(
    private reviewsService: ReviewsService,
    private adminReviewsService: AdminReviewsService // If generated
  ) {}

  /**
   * Get all reviews with filters and pagination
   */
  getAllReviews(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    rating?: number,
    search?: string
  ): Observable<{
    reviews: ReviewDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.adminReviewsService.apiAdminReviewsGet(page, pageSize, status, rating, search).pipe(
      map(response => ({
        reviews: response.data?.items || [],
        total: response.data?.totalItems || 0,
        page: response.data?.page || page,
        pageSize: response.data?.pageSize || pageSize
      }))
    );
  }

  /**
   * Get review by ID
   */
  getReviewById(id: number): Observable<ReviewDto | undefined> {
    return this.reviewsService.apiReviewsIdGet(id).pipe(
      map(response => response.data)
    );
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
   * Reject review
   */
  rejectReview(id: number): Observable<ReviewDto | undefined> {
    return this.reviewsService.apiReviewsIdRejectPut(id).pipe(
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
}
```

## Step 5: Add Routes

Add the review routes to your admin routing module:

```typescript
// admin-routing.module.ts or admin.routes.ts
import { Routes } from '@angular/router';
import { ReviewsAdminComponent } from './pages/reviews/reviews-admin.component';
import { ReviewListAdminComponent } from './pages/reviews/review-list-admin.component';

export const adminRoutes: Routes = [
  // ... other routes
  {
    path: 'reviews',
    component: ReviewsAdminComponent,
    children: [
      { path: '', component: ReviewListAdminComponent }
    ]
  }
];
```

## Step 6: Add Navigation Link

Add a link to the admin navigation menu:

```html
<!-- admin-layout.component.html or similar -->
<nav>
  <!-- ... other nav items -->
  <a
    routerLink="/admin/reviews"
    routerLinkActive="active"
    class="nav-link"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
    <span>Reviews</span>
  </a>
</nav>
```

## Step 7: Update Component to Use Real API

Update the `review-list-admin.component.ts` `loadReviews()` method:

```typescript
loadReviews(): void {
  this.loading = true;
  this.error = '';

  this.adminReviewService.getAllReviews(
    this.currentPage,
    this.pageSize,
    this.selectedStatus,
    this.selectedRating,
    this.searchQuery || undefined
  ).subscribe({
    next: (response) => {
      this.reviews = response.reviews || [];
      this.filteredReviews = this.reviews;
      this.totalItems = response.total;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.error = 'Unable to load reviews';
      this.notificationService.error('Unable to load reviews');
      this.loading = false;
      this.cdr.detectChanges();
      console.error('Error loading reviews:', err);
    }
  });
}
```

And remove the `applyFilters()` call since filtering will be done server-side.

## Step 8: Test the Component

1. Start your backend API
2. Start the Angular development server:
   ```bash
   ng serve
   ```
3. Navigate to `/admin/reviews`
4. Test all features:
   - View reviews list
   - Filter by status, rating, search
   - Approve/reject/delete reviews
   - Bulk actions
   - View detail modal
   - Pagination

## Step 9: Add Authorization (Optional)

Ensure only admins can access this component:

```typescript
// In your route configuration
{
  path: 'reviews',
  component: ReviewsAdminComponent,
  canActivate: [AdminGuard], // Your admin guard
  children: [
    { path: '', component: ReviewListAdminComponent }
  ]
}
```

## Troubleshooting

### Reviews not loading
- Check that the backend endpoint is working: `GET /api/admin/reviews`
- Verify the user has admin role and proper authentication
- Check browser console for errors
- Verify OpenAPI client was regenerated after adding endpoints

### Approve/Reject not working
- Verify the endpoints exist: `PUT /api/reviews/{id}/approve` and `PUT /api/reviews/{id}/reject`
- Check that the user has permission (admin role)
- Verify the review ID is correct

### Bulk actions failing
- Check that each individual approve/reject endpoint works first
- Verify network tab for failed requests
- Check console for error messages

## Performance Considerations

For large numbers of reviews:

1. **Server-side pagination** - Already implemented
2. **Server-side filtering** - Move filtering logic to backend
3. **Lazy loading** - Consider virtual scrolling for very long lists
4. **Caching** - Implement response caching for frequently accessed data
5. **Debouncing** - Add debounce to search input

Example debounce for search:

```typescript
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

private searchSubject = new Subject<string>();

ngOnInit(): void {
  this.loadReviews();

  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(searchTerm => {
    this.searchQuery = searchTerm;
    this.onSearch();
  });
}

onSearchInput(value: string): void {
  this.searchSubject.next(value);
}
```

## Production Checklist

- [ ] Backend endpoints implemented and tested
- [ ] OpenAPI client regenerated
- [ ] AdminReviewService updated with real API calls
- [ ] Routes configured
- [ ] Navigation link added
- [ ] Authorization guard applied
- [ ] Component tested with real data
- [ ] Error handling verified
- [ ] Mobile responsiveness tested
- [ ] Performance optimized for large datasets
- [ ] Admin notifications configured
- [ ] Logging implemented for audit trail

## Support

For issues or questions:
1. Check the README.md for detailed feature documentation
2. Review the component code comments
3. Test the backend API endpoints directly
4. Check browser console and network tab for errors
