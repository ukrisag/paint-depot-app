import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReviewService } from '../../services/admin-review.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
import { ReviewDto } from '../../../services/openapi-client/model/reviewDto';

@Component({
  selector: 'app-review-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-list-admin.component.html',
  styleUrls: ['./review-list-admin.component.css']
})
export class ReviewListAdminComponent implements OnInit {
  reviews = signal<ReviewDto[]>([]);
  filteredReviews = signal<ReviewDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedStatus = signal<string | undefined>(undefined);
  selectedRating = signal<number | undefined>(undefined);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Selection for bulk actions
  selectedReviewIds = signal(new Set<number>());
  selectAll = signal(false);

  // Modal states
  showDetailModal = signal(false);
  showDeleteConfirm = signal(false);
  showApproveConfirm = signal(false);
  showRejectConfirm = signal(false);
  showBulkApproveConfirm = signal(false);
  showBulkRejectConfirm = signal(false);

  // Current review for actions
  currentReview = signal<ReviewDto | undefined>(undefined);
  adminResponseText = signal('');

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
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set('');

    // Note: This is a mock implementation
    // In production, you need an API endpoint that returns all reviews
    // For now, we'll use empty array or mock data
    this.adminReviewService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews || []);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load reviews');
        this.notificationService.error('Unable to load reviews');
        this.loading.set(false);
        console.error('Error loading reviews:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reviews()];

    // Filter by status
    if (this.selectedStatus()) {
      filtered = filtered.filter(r => r.status === this.selectedStatus());
    }

    // Filter by rating
    if (this.selectedRating()) {
      filtered = filtered.filter(r => r.rating === this.selectedRating());
    }

    // Filter by search query (product name or reviewer name)
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(r =>
        (r.userName?.toLowerCase().includes(query)) ||
        (r.title?.toLowerCase().includes(query)) ||
        (r.comment?.toLowerCase().includes(query))
      );
    }

    this.filteredReviews.set(filtered);
    this.totalItems.set(filtered.length);

    // Reset to first page if current page is out of bounds
    if (this.currentPage() > this.totalPages() && this.totalPages() > 0) {
      this.currentPage.set(1);
    }
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set(undefined);
    this.selectedRating.set(undefined);
    this.currentPage.set(1);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo(0, 0);
  }

  getPaginatedReviews(): ReviewDto[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredReviews().slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxPages - 1);

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
    this.currentReview.set(review);
    this.adminResponseText.set(review.adminResponse || '');
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.currentReview.set(undefined);
    this.adminResponseText.set('');
  }

  // Approve review
  onApproveClick(review: ReviewDto): void {
    this.currentReview.set(review);
    this.showApproveConfirm.set(true);
  }

  onConfirmApprove(): void {
    if (!this.currentReview()?.id) return;

    this.adminReviewService.approveReview(this.currentReview()!.id!, this.adminResponseText() || undefined).subscribe({
      next: (updatedReview) => {
        if (updatedReview) {
          this.reviews.update(reviews => {
            const index = reviews.findIndex(r => r.id === updatedReview.id);
            if (index !== -1) {
              const updated = [...reviews];
              updated[index] = updatedReview;
              return updated;
            }
            return reviews;
          });
          this.applyFilters();
          this.notificationService.success('Review approved successfully');
        }
        this.showApproveConfirm.set(false);
        this.currentReview.set(undefined);
        this.adminResponseText.set('');
      },
      error: (err) => {
        this.notificationService.error('Unable to approve review');
        this.showApproveConfirm.set(false);
        this.currentReview.set(undefined);
        this.adminResponseText.set('');
        console.error('Error approving review:', err);
      }
    });
  }

  onCancelApprove(): void {
    this.showApproveConfirm.set(false);
    this.currentReview.set(undefined);
    this.adminResponseText.set('');
  }

  // Reject review
  onRejectClick(review: ReviewDto): void {
    this.currentReview.set(review);
    this.showRejectConfirm.set(true);
  }

  onConfirmReject(): void {
    if (!this.currentReview()?.id) return;

    this.adminReviewService.rejectReview(this.currentReview()!.id!).subscribe({
      next: (updatedReview) => {
        if (updatedReview) {
          this.reviews.update(reviews => {
            const index = reviews.findIndex(r => r.id === updatedReview.id);
            if (index !== -1) {
              const updated = [...reviews];
              updated[index] = updatedReview;
              return updated;
            }
            return reviews;
          });
          this.applyFilters();
          this.notificationService.success('Review rejected successfully');
        }
        this.showRejectConfirm.set(false);
        this.currentReview.set(undefined);
      },
      error: (err) => {
        this.notificationService.error('Unable to reject review');
        this.showRejectConfirm.set(false);
        this.currentReview.set(undefined);
        console.error('Error rejecting review:', err);
      }
    });
  }

  onCancelReject(): void {
    this.showRejectConfirm.set(false);
    this.currentReview.set(undefined);
  }

  // Delete review
  onDeleteClick(review: ReviewDto): void {
    this.currentReview.set(review);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    if (!this.currentReview()?.id) return;

    this.adminReviewService.deleteReview(this.currentReview()!.id!).subscribe({
      next: () => {
        this.reviews.update(reviews => reviews.filter(r => r.id !== this.currentReview()?.id));
        this.applyFilters();
        this.notificationService.success('Review deleted successfully');
        this.showDeleteConfirm.set(false);
        this.currentReview.set(undefined);
      },
      error: (err) => {
        this.notificationService.error('Unable to delete review');
        this.showDeleteConfirm.set(false);
        this.currentReview.set(undefined);
        console.error('Error deleting review:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.currentReview.set(undefined);
  }

  // Bulk selection
  toggleSelectAll(): void {
    if (this.selectAll()) {
      // Select all on current page
      this.selectedReviewIds.update(ids => {
        const newIds = new Set(ids);
        this.getPaginatedReviews().forEach(review => {
          if (review.id) {
            newIds.add(review.id);
          }
        });
        return newIds;
      });
    } else {
      // Deselect all
      this.selectedReviewIds.set(new Set<number>());
    }
  }

  toggleReviewSelection(reviewId: number | undefined): void {
    if (!reviewId) return;

    this.selectedReviewIds.update(ids => {
      const newIds = new Set(ids);
      if (newIds.has(reviewId)) {
        newIds.delete(reviewId);
      } else {
        newIds.add(reviewId);
      }
      return newIds;
    });

    // Update selectAll checkbox state
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    const currentPageReviewIds = this.getPaginatedReviews()
      .map(r => r.id)
      .filter(id => id !== undefined) as number[];

    this.selectAll.set(currentPageReviewIds.length > 0 &&
      currentPageReviewIds.every(id => this.selectedReviewIds().has(id)));
  }

  isReviewSelected(reviewId: number | undefined): boolean {
    return reviewId !== undefined && this.selectedReviewIds().has(reviewId);
  }

  // Bulk approve
  onBulkApproveClick(): void {
    if (this.selectedReviewIds().size === 0) {
      this.notificationService.info('Please select reviews to approve');
      return;
    }
    this.showBulkApproveConfirm.set(true);
  }

  onConfirmBulkApprove(): void {
    const reviewIds = Array.from(this.selectedReviewIds());
    let completedCount = 0;
    let errorCount = 0;

    reviewIds.forEach(id => {
      this.adminReviewService.approveReview(id).subscribe({
        next: (updatedReview) => {
          completedCount++;
          if (updatedReview) {
            this.reviews.update(reviews => {
              const index = reviews.findIndex(r => r.id === updatedReview.id);
              if (index !== -1) {
                const updated = [...reviews];
                updated[index] = updatedReview;
                return updated;
              }
              return reviews;
            });
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
    this.showBulkApproveConfirm.set(false);
  }

  // Bulk reject
  onBulkRejectClick(): void {
    if (this.selectedReviewIds().size === 0) {
      this.notificationService.info('Please select reviews to reject');
      return;
    }
    this.showBulkRejectConfirm.set(true);
  }

  onConfirmBulkReject(): void {
    const reviewIds = Array.from(this.selectedReviewIds());
    let completedCount = 0;
    let errorCount = 0;

    reviewIds.forEach(id => {
      this.adminReviewService.rejectReview(id).subscribe({
        next: (updatedReview) => {
          completedCount++;
          if (updatedReview) {
            this.reviews.update(reviews => {
              const index = reviews.findIndex(r => r.id === updatedReview.id);
              if (index !== -1) {
                const updated = [...reviews];
                updated[index] = updatedReview;
                return updated;
              }
              return reviews;
            });
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
    this.showBulkRejectConfirm.set(false);
  }

  finishBulkOperation(successCount: number, errorCount: number, action: string): void {
    this.selectedReviewIds.set(new Set<number>());
    this.selectAll.set(false);
    this.showBulkApproveConfirm.set(false);
    this.showBulkRejectConfirm.set(false);
    this.applyFilters();

    if (errorCount === 0) {
      this.notificationService.success(`${successCount} review(s) ${action} successfully`);
    } else if (successCount === 0) {
      this.notificationService.error(`Failed to ${action.slice(0, -2)} reviews`);
    } else {
      this.notificationService.info(`${successCount} review(s) ${action}, ${errorCount} failed`);
    }
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

  // Report downloads
  downloadExcel(): void {
    this.reportService.downloadReviewsExcel();
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    this.reportService.downloadReviewsPdf();
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
