import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReviewService } from '../../services/admin-review.service';
import { NotificationService } from '../../../services/notification.service';
import { ReviewDto } from '../../../services/openapi-client/model/reviewDto';

@Component({
  selector: 'app-review-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-list-admin.component.html',
  styleUrls: ['./review-list-admin.component.css']
})
export class ReviewListAdminComponent implements OnInit {
  reviews: ReviewDto[] = [];
  filteredReviews: ReviewDto[] = [];

  loading = true;
  error = '';

  // Filters
  searchQuery = '';
  selectedStatus?: string;
  selectedRating?: number;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 1;

  // Selection for bulk actions
  selectedReviewIds = new Set<number>();
  selectAll = false;

  // Modal states
  showDetailModal = false;
  showDeleteConfirm = false;
  showApproveConfirm = false;
  showRejectConfirm = false;
  showBulkApproveConfirm = false;
  showBulkRejectConfirm = false;

  // Current review for actions
  currentReview?: ReviewDto;
  adminResponseText = '';

  // Available statuses
  statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Available ratings
  ratings = [1, 2, 3, 4, 5];

  constructor(
    private adminReviewService: AdminReviewService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';

    // Note: This is a mock implementation
    // In production, you need an API endpoint that returns all reviews
    // For now, we'll use empty array or mock data
    this.adminReviewService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.applyFilters();
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

  applyFilters(): void {
    let filtered = [...this.reviews];

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    // Filter by rating
    if (this.selectedRating) {
      filtered = filtered.filter(r => r.rating === this.selectedRating);
    }

    // Filter by search query (product name or reviewer name)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.userName?.toLowerCase().includes(query)) ||
        (r.title?.toLowerCase().includes(query)) ||
        (r.comment?.toLowerCase().includes(query))
      );
    }

    this.filteredReviews = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Reset to first page if current page is out of bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = undefined;
    this.selectedRating = undefined;
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo(0, 0);
  }

  getPaginatedReviews(): ReviewDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredReviews.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // View detail modal
  onViewDetail(review: ReviewDto): void {
    this.currentReview = review;
    this.adminResponseText = review.adminResponse || '';
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.currentReview = undefined;
    this.adminResponseText = '';
  }

  // Approve review
  onApproveClick(review: ReviewDto): void {
    this.currentReview = review;
    this.showApproveConfirm = true;
  }

  onConfirmApprove(): void {
    if (!this.currentReview?.id) return;

    this.adminReviewService.approveReview(this.currentReview.id, this.adminResponseText || undefined).subscribe({
      next: (updatedReview) => {
        if (updatedReview) {
          const index = this.reviews.findIndex(r => r.id === updatedReview.id);
          if (index !== -1) {
            this.reviews[index] = updatedReview;
          }
          this.applyFilters();
          this.notificationService.success('Review approved successfully');
        }
        this.showApproveConfirm = false;
        this.currentReview = undefined;
        this.adminResponseText = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to approve review');
        this.showApproveConfirm = false;
        this.currentReview = undefined;
        this.adminResponseText = '';
        this.cdr.detectChanges();
        console.error('Error approving review:', err);
      }
    });
  }

  onCancelApprove(): void {
    this.showApproveConfirm = false;
    this.currentReview = undefined;
    this.adminResponseText = '';
  }

  // Reject review
  onRejectClick(review: ReviewDto): void {
    this.currentReview = review;
    this.showRejectConfirm = true;
  }

  onConfirmReject(): void {
    if (!this.currentReview?.id) return;

    this.adminReviewService.rejectReview(this.currentReview.id).subscribe({
      next: (updatedReview) => {
        if (updatedReview) {
          const index = this.reviews.findIndex(r => r.id === updatedReview.id);
          if (index !== -1) {
            this.reviews[index] = updatedReview;
          }
          this.applyFilters();
          this.notificationService.success('Review rejected successfully');
        }
        this.showRejectConfirm = false;
        this.currentReview = undefined;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to reject review');
        this.showRejectConfirm = false;
        this.currentReview = undefined;
        this.cdr.detectChanges();
        console.error('Error rejecting review:', err);
      }
    });
  }

  onCancelReject(): void {
    this.showRejectConfirm = false;
    this.currentReview = undefined;
  }

  // Delete review
  onDeleteClick(review: ReviewDto): void {
    this.currentReview = review;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.currentReview?.id) return;

    this.adminReviewService.deleteReview(this.currentReview.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.currentReview?.id);
        this.applyFilters();
        this.notificationService.success('Review deleted successfully');
        this.showDeleteConfirm = false;
        this.currentReview = undefined;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to delete review');
        this.showDeleteConfirm = false;
        this.currentReview = undefined;
        this.cdr.detectChanges();
        console.error('Error deleting review:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.currentReview = undefined;
  }

  // Bulk selection
  toggleSelectAll(): void {
    if (this.selectAll) {
      // Select all on current page
      this.getPaginatedReviews().forEach(review => {
        if (review.id) {
          this.selectedReviewIds.add(review.id);
        }
      });
    } else {
      // Deselect all
      this.selectedReviewIds.clear();
    }
    this.cdr.detectChanges();
  }

  toggleReviewSelection(reviewId: number | undefined): void {
    if (!reviewId) return;

    if (this.selectedReviewIds.has(reviewId)) {
      this.selectedReviewIds.delete(reviewId);
    } else {
      this.selectedReviewIds.add(reviewId);
    }

    // Update selectAll checkbox state
    this.updateSelectAllState();
    this.cdr.detectChanges();
  }

  updateSelectAllState(): void {
    const currentPageReviewIds = this.getPaginatedReviews()
      .map(r => r.id)
      .filter(id => id !== undefined) as number[];

    this.selectAll = currentPageReviewIds.length > 0 &&
      currentPageReviewIds.every(id => this.selectedReviewIds.has(id));
  }

  isReviewSelected(reviewId: number | undefined): boolean {
    return reviewId !== undefined && this.selectedReviewIds.has(reviewId);
  }

  // Bulk approve
  onBulkApproveClick(): void {
    if (this.selectedReviewIds.size === 0) {
      this.notificationService.info('Please select reviews to approve');
      return;
    }
    this.showBulkApproveConfirm = true;
  }

  onConfirmBulkApprove(): void {
    const reviewIds = Array.from(this.selectedReviewIds);
    let completedCount = 0;
    let errorCount = 0;

    reviewIds.forEach(id => {
      this.adminReviewService.approveReview(id).subscribe({
        next: (updatedReview) => {
          completedCount++;
          if (updatedReview) {
            const index = this.reviews.findIndex(r => r.id === updatedReview.id);
            if (index !== -1) {
              this.reviews[index] = updatedReview;
            }
          }

          if (completedCount + errorCount === reviewIds.length) {
            this.finishBulkOperation(completedCount, errorCount, 'approved');
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Error approving review ${id}:`, err);

          if (completedCount + errorCount === reviewIds.length) {
            this.finishBulkOperation(completedCount, errorCount, 'approved');
          }
        }
      });
    });
  }

  onCancelBulkApprove(): void {
    this.showBulkApproveConfirm = false;
  }

  // Bulk reject
  onBulkRejectClick(): void {
    if (this.selectedReviewIds.size === 0) {
      this.notificationService.info('Please select reviews to reject');
      return;
    }
    this.showBulkRejectConfirm = true;
  }

  onConfirmBulkReject(): void {
    const reviewIds = Array.from(this.selectedReviewIds);
    let completedCount = 0;
    let errorCount = 0;

    reviewIds.forEach(id => {
      this.adminReviewService.rejectReview(id).subscribe({
        next: (updatedReview) => {
          completedCount++;
          if (updatedReview) {
            const index = this.reviews.findIndex(r => r.id === updatedReview.id);
            if (index !== -1) {
              this.reviews[index] = updatedReview;
            }
          }

          if (completedCount + errorCount === reviewIds.length) {
            this.finishBulkOperation(completedCount, errorCount, 'rejected');
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Error rejecting review ${id}:`, err);

          if (completedCount + errorCount === reviewIds.length) {
            this.finishBulkOperation(completedCount, errorCount, 'rejected');
          }
        }
      });
    });
  }

  onCancelBulkReject(): void {
    this.showBulkRejectConfirm = false;
  }

  finishBulkOperation(successCount: number, errorCount: number, action: string): void {
    this.selectedReviewIds.clear();
    this.selectAll = false;
    this.showBulkApproveConfirm = false;
    this.showBulkRejectConfirm = false;
    this.applyFilters();

    if (errorCount === 0) {
      this.notificationService.success(`${successCount} review(s) ${action} successfully`);
    } else if (successCount === 0) {
      this.notificationService.error(`Failed to ${action.slice(0, -2)} reviews`);
    } else {
      this.notificationService.info(`${successCount} review(s) ${action}, ${errorCount} failed`);
    }

    this.cdr.detectChanges();
  }

  // Helper methods
  getStatusClass(status: string | null | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'rejected':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  getStarArray(rating: number | undefined): boolean[] {
    const stars = new Array(5).fill(false);
    if (rating) {
      for (let i = 0; i < rating && i < 5; i++) {
        stars[i] = true;
      }
    }
    return stars;
  }

  truncateText(text: string | null | undefined, maxLength: number): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
