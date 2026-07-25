import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ProductImage {
  id?: number;
  file?: File;
  url: string;
  isPrimary: boolean;
  altText: string;
  displayOrder: number;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() images: ProductImage[] = [];
  @Input() maxImages = 10;
  @Input() accept = 'image/*';
  @Input() maxSize = 5 * 1024 * 1024; // 5MB

  @Output() imagesChange = new EventEmitter<ProductImage[]>();

  isDragging = false;
  error: string | null = null;
  editingAltIndex: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.ensurePrimaryImage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['images'] && changes['images'].currentValue) {
      this.ensurePrimaryImage();
      this.cdr.detectChanges();
    }
  }

  private ensurePrimaryImage() {
    // Ensure at least one image is primary
    if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
      this.images[0].isPrimary = true;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    // Reset input value to allow selecting same file again
    (event.target as HTMLInputElement).value = '';
  }

  private handleFiles(files: File[]) {
    this.error = null;

    // Check if we can add more images
    const remainingSlots = this.maxImages - this.images.length;
    if (remainingSlots <= 0) {
      this.error = `สามารถอัปโหลดได้สูงสุด ${this.maxImages} รูป`;
      return;
    }

    // Validate and process files
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        this.error = 'กรุณาเลือกไฟล์รูปภาพเท่านั้น';
        return;
      }
      if (file.size > this.maxSize) {
        this.error = `ขนาดไฟล์ไม่ควรเกิน ${this.maxSize / 1024 / 1024}MB`;
        return;
      }

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ProductImage = {
          file: file,
          url: e.target?.result as string,
          isPrimary: this.images.length === 0, // First image is primary
          altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          displayOrder: this.images.length
        };

        this.images.push(newImage);
        this.imagesChange.emit(this.images);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
  }

  setPrimary(index: number) {
    this.images.forEach((img, i) => {
      img.isPrimary = i === index;
    });
    this.imagesChange.emit(this.images);
    this.cdr.detectChanges();
  }

  removeImage(index: number) {
    const wasPrimary = this.images[index].isPrimary;
    this.images.splice(index, 1);

    // If removed image was primary, set first image as primary
    if (wasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    // Update display order
    this.images.forEach((img, i) => {
      img.displayOrder = i;
    });

    this.imagesChange.emit(this.images);
    this.cdr.detectChanges();
  }

  moveUp(index: number) {
    if (index === 0) return;
    this.swapImages(index, index - 1);
  }

  moveDown(index: number) {
    if (index === this.images.length - 1) return;
    this.swapImages(index, index + 1);
  }

  private swapImages(index1: number, index2: number) {
    [this.images[index1], this.images[index2]] = [this.images[index2], this.images[index1]];
    this.images.forEach((img, i) => {
      img.displayOrder = i;
    });
    this.imagesChange.emit(this.images);
    this.cdr.detectChanges();
  }

  startEditAlt(index: number) {
    this.editingAltIndex = index;
  }

  saveAltText(index: number, altText: string) {
    this.images[index].altText = altText;
    this.editingAltIndex = null;
    this.imagesChange.emit(this.images);
    this.cdr.detectChanges();
  }

  cancelEditAlt() {
    this.editingAltIndex = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  clearAll() {
    if (confirm('ต้องการลบรูปภาพทั้งหมดหรือไม่?')) {
      this.images = [];
      this.imagesChange.emit(this.images);
      this.cdr.detectChanges();
    }
  }
}
