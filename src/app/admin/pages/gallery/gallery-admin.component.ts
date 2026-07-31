import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminGalleryService } from '../../services/admin-gallery.service';
import { GalleryImageDto, CreateGalleryImageDto, UpdateGalleryImageDto } from '../../../services/openapi-client';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './gallery-admin.component.html',
  styleUrls: ['./gallery-admin.component.css']
})
export class GalleryAdminComponent implements OnInit {
  // State signals
  images = signal<GalleryImageDto[]>([]);
  loading = signal(false);
  initialLoading = signal(true);
  showModal = signal(false);
  showDeleteModal = signal(false);
  isEditMode = signal(false);
  currentImage = signal<GalleryImageDto | null>(null);
  searchTerm = signal('');
  selectedCategory = signal('');
  selectedStatus = signal('');
  sortBy = signal('created_desc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(12);
  totalItems = signal(0);
  totalPages = signal(0);

  // Upload
  imagePreview = signal<string>('');
  uploadingImage = signal(false);
  selectedFile: File | null = null;

  // Form
  imageForm: FormGroup;

  constructor(
    private adminGalleryService: AdminGalleryService,
    private fb: FormBuilder
  ) {
    this.imageForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      imageUrl: [''], // Not required - will be filled after upload
      thumbnailUrl: [''],
      altText: ['', Validators.maxLength(255)],
      category: ['', Validators.maxLength(100)],
      displayOrder: [0],
      isFeatured: [false],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.loading.set(true);

    const category = this.selectedCategory() || undefined;
    const isFeatured = undefined; // Can be extended for filtering

    this.adminGalleryService.getGalleryImages(
      this.currentPage(),
      this.pageSize(),
      category,
      isFeatured
    ).subscribe({
      next: (response) => {
        if (response) {
          let items = response.items || [];

          // Apply search filter
          if (this.searchTerm()) {
            const term = this.searchTerm().toLowerCase();
            items = items.filter(img =>
              img.title?.toLowerCase().includes(term) ||
              img.description?.toLowerCase().includes(term) ||
              img.category?.toLowerCase().includes(term)
            );
          }

          // Apply status filter
          if (this.selectedStatus() === 'active') {
            items = items.filter(img => img.isActive);
          } else if (this.selectedStatus() === 'inactive') {
            items = items.filter(img => !img.isActive);
          }

          // Apply sorting
          items = this.sortImages(items);

          this.images.set(items);
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

  sortImages(items: GalleryImageDto[]): GalleryImageDto[] {
    const sorted = [...items];
    switch (this.sortBy()) {
      case 'title_asc':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title_desc':
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'created_asc':
        return sorted.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
      case 'created_desc':
        return sorted.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      case 'views_desc':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      default:
        return sorted;
    }
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
    this.loadImages();
  }

  onCategoryChange() {
    this.currentPage.set(1);
    this.loadImages();
  }

  onStatusChange() {
    this.currentPage.set(1);
    this.loadImages();
  }

  onSortChange() {
    this.loadImages();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentImage.set(null);
    this.imageForm.reset({
      displayOrder: 0,
      isFeatured: false,
      isActive: true
    });
    this.imagePreview.set('');
    this.selectedFile = null;
    this.showModal.set(true);
  }

  openEditModal(image: GalleryImageDto) {
    this.isEditMode.set(true);
    this.currentImage.set(image);
    this.imageForm.patchValue({
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
      altText: image.altText,
      category: image.category,
      displayOrder: image.displayOrder,
      isFeatured: image.isFeatured,
      isActive: image.isActive
    });
    this.imagePreview.set(image.imageUrl || '');
    this.selectedFile = null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.imageForm.reset();
    this.imagePreview.set('');
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      this.selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (!this.selectedFile) {
      return;
    }

    this.uploadingImage.set(true);

    this.adminGalleryService.uploadGalleryImage(this.selectedFile).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.imageForm.patchValue({
            imageUrl: response.data
          });
          this.uploadingImage.set(false);
        }
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        this.uploadingImage.set(false);
      }
    });
  }

  saveImage() {
    // Validate required fields
    if (this.imageForm.get('title')?.invalid) {
      this.imageForm.get('title')?.markAsTouched();
      alert('กรุณากรอกชื่อรูปภาพ');
      return;
    }

    // Check if image is provided
    const hasImageUrl = this.imageForm.get('imageUrl')?.value;
    const hasSelectedFile = this.selectedFile;

    if (!hasImageUrl && !hasSelectedFile) {
      alert('กรุณาเลือกรูปภาพ');
      return;
    }

    // If file is selected but not uploaded yet, upload first
    if (hasSelectedFile && !hasImageUrl) {
      this.uploadingImage.set(true);
      this.adminGalleryService.uploadGalleryImage(this.selectedFile!).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.imageForm.patchValue({ imageUrl: response.data });
            this.uploadingImage.set(false);
            // Now save the data
            this.saveImageData();
          } else {
            this.uploadingImage.set(false);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.uploadingImage.set(false);
          alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        }
      });
    } else {
      // Image URL already exists, save directly
      this.saveImageData();
    }
  }

  saveImageData() {
    const formValue = this.imageForm.value;

    if (this.isEditMode() && this.currentImage()) {
      const updateDto: UpdateGalleryImageDto = formValue;
      this.adminGalleryService.updateGalleryImage(this.currentImage()!.id!, updateDto).subscribe({
        next: () => {
          this.closeModal();
          this.loadImages();
        },
        error: (error) => {
          console.error('Error updating image:', error);
          alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        }
      });
    } else {
      const createDto: CreateGalleryImageDto = formValue;
      this.adminGalleryService.createGalleryImage(createDto).subscribe({
        next: () => {
          this.closeModal();
          this.loadImages();
        },
        error: (error) => {
          console.error('Error creating image:', error);
          alert('เกิดข้อผิดพลาดในการสร้างข้อมูล');
        }
      });
    }
  }

  openDeleteModal(image: GalleryImageDto) {
    this.currentImage.set(image);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.currentImage.set(null);
  }

  confirmDelete() {
    if (!this.currentImage()) return;

    this.adminGalleryService.deleteGalleryImage(this.currentImage()!.id!).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadImages();
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    });
  }

  toggleActiveStatus(image: GalleryImageDto) {
    this.adminGalleryService.toggleActiveStatus(image.id!).subscribe({
      next: () => {
        this.loadImages();
      },
      error: (error) => {
        console.error('Error toggling active status:', error);
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    });
  }

  toggleFeaturedStatus(image: GalleryImageDto) {
    this.adminGalleryService.toggleFeaturedStatus(image.id!).subscribe({
      next: () => {
        this.loadImages();
      },
      error: (error) => {
        console.error('Error toggling featured status:', error);
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    });
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadImages();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadImages();
    }
  }
}
