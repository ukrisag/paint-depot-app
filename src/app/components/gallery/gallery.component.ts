import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryService } from '../../services/gallery.service';
import { GalleryImageDto } from '../../services/openapi-client';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  // State signals
  images = signal<GalleryImageDto[]>([]);
  categories = signal<string[]>([]);
  loading = signal(false);
  initialLoading = signal(true);
  selectedCategory = signal<string>('');
  showFeaturedOnly = signal(false);
  currentPage = signal(1);
  pageSize = signal(12);
  totalItems = signal(0);
  totalPages = signal(0);

  // Lightbox state
  showLightbox = signal(false);
  currentImageIndex = signal(0);

  // Computed
  hasMore = computed(() => this.currentPage() < this.totalPages());
  currentImage = computed(() => this.images()[this.currentImageIndex()]);

  constructor(private galleryService: GalleryService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadImages();
  }

  loadCategories() {
    this.galleryService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories.set(response.data);
        }
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadImages(append: boolean = false) {
    this.loading.set(true);

    const category = this.selectedCategory() || undefined;
    const isFeatured = this.showFeaturedOnly() || undefined;

    this.galleryService.getGalleryImages(
      this.currentPage(),
      this.pageSize(),
      category,
      isFeatured
    ).subscribe({
      next: (response) => {
        if (response) {
          if (append) {
            this.images.update(current => [...current, ...(response.items || [])]);
          } else {
            this.images.set(response.items || []);
          }
          this.totalItems.set(response.totalItems || 0);
          this.totalPages.set(response.totalPages || 0);
        }
        this.loading.set(false);
        this.initialLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.loading.set(false);
        this.initialLoading.set(false);
      }
    });
  }

  onCategoryChange() {
    this.currentPage.set(1);
    this.loadImages(false);
  }

  onFeaturedToggle() {
    this.currentPage.set(1);
    this.loadImages(false);
  }

  loadMore() {
    if (this.hasMore() && !this.loading()) {
      this.currentPage.update(page => page + 1);
      this.loadImages(true);
    }
  }

  openLightbox(index: number) {
    this.currentImageIndex.set(index);
    this.showLightbox.set(true);
  }

  closeLightbox() {
    this.showLightbox.set(false);
  }

  nextImage() {
    if (this.currentImageIndex() < this.images().length - 1) {
      this.currentImageIndex.update(i => i + 1);
    }
  }

  prevImage() {
    if (this.currentImageIndex() > 0) {
      this.currentImageIndex.update(i => i - 1);
    }
  }

  onLightboxBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('lightbox-backdrop')) {
      this.closeLightbox();
    }
  }
}
