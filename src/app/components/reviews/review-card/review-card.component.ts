import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCardComponent {
  @Input() review!: ReviewDto;

  getInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStarArray(): boolean[] {
    return Array(5).fill(false).map((_, index) => index < (this.review.rating || 0));
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDisplayName(): string {
    return this.review.userName || 'ผู้ใช้งาน';
  }

  isApproved(): boolean {
    return this.review.status === 'Approved';
  }

  getStatusText(): string {
    switch (this.review.status) {
      case 'Pending':
        return 'รอการอนุมัติ';
      case 'Rejected':
        return 'ถูกปฏิเสธ';
      default:
        return '';
    }
  }

  getStatusClass(): string {
    switch (this.review.status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }
}
