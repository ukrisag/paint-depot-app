import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';
import { NotificationService } from '../../../services/notification.service';
import { ReviewDto, CreateReviewDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: number;
  @Input() existingReview?: ReviewDto;
  @Output() reviewSubmitted = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  reviewForm!: FormGroup;
  loading = false;
  hoveredStar = 0;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reviewForm = this.fb.group({
      rating: [this.existingReview?.rating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: [this.existingReview?.title || ''],
      comment: [
        this.existingReview?.comment || '',
        [Validators.required, Validators.minLength(10)]
      ]
    });
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isStarFilled(star: number): boolean {
    const currentRating = this.reviewForm.get('rating')?.value || 0;
    const displayRating = this.hoveredStar || currentRating;
    return star <= displayRating;
  }

  onSubmit() {
    if (this.reviewForm.invalid) {
      this.markFormGroupTouched(this.reviewForm);
      return;
    }

    this.loading = true;
    const formValue = this.reviewForm.value;

    const reviewData: CreateReviewDto = {
      rating: formValue.rating,
      title: formValue.title || undefined,
      comment: formValue.comment
    };

    this.reviewService.createReview(this.productId, reviewData).subscribe({
      next: () => {
        this.notificationService.success('ส่งรีวิวเรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ');
        this.loading = false;
        this.reviewSubmitted.emit();
      },
      error: (error) => {
        this.notificationService.error(error.message || 'เกิดข้อผิดพลาดในการส่งรีวิว');
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.formClosed.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get rating() {
    return this.reviewForm.get('rating');
  }

  get title() {
    return this.reviewForm.get('title');
  }

  get comment() {
    return this.reviewForm.get('comment');
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  setHoveredStar(star: number) {
    this.hoveredStar = star;
  }

  clearHoveredStar() {
    this.hoveredStar = 0;
  }
}
