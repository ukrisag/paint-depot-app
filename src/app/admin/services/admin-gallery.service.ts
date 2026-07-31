import { Injectable, inject } from '@angular/core';
import { GalleryService as ApiGalleryService, UploadService, CreateGalleryImageDto, UpdateGalleryImageDto } from '../../services/openapi-client';

@Injectable({
  providedIn: 'root'
})
export class AdminGalleryService {
  private apiGalleryService = inject(ApiGalleryService);
  private uploadService = inject(UploadService);

  /**
   * Get all gallery images including inactive (admin only)
   */
  getGalleryImages(page: number = 1, pageSize: number = 12, category?: string, isFeatured?: boolean) {
    return this.apiGalleryService.apiGalleryAdminGet(page, pageSize, category, isFeatured);
  }

  /**
   * Get gallery image by ID
   */
  getGalleryImageById(id: number) {
    return this.apiGalleryService.apiGalleryIdGet(id);
  }

  /**
   * Create new gallery image
   */
  createGalleryImage(dto: CreateGalleryImageDto) {
    return this.apiGalleryService.apiGalleryPost(dto);
  }

  /**
   * Update gallery image
   */
  updateGalleryImage(id: number, dto: UpdateGalleryImageDto) {
    return this.apiGalleryService.apiGalleryIdPut(id, dto);
  }

  /**
   * Delete gallery image
   */
  deleteGalleryImage(id: number) {
    return this.apiGalleryService.apiGalleryIdDelete(id);
  }

  /**
   * Toggle active status
   */
  toggleActiveStatus(id: number) {
    return this.apiGalleryService.apiGalleryIdToggleActivePatch(id);
  }

  /**
   * Toggle featured status
   */
  toggleFeaturedStatus(id: number) {
    return this.apiGalleryService.apiGalleryIdToggleFeaturedPatch(id);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return this.apiGalleryService.apiGalleryCategoriesGet();
  }

  /**
   * Upload gallery image
   */
  uploadGalleryImage(file: Blob) {
    return this.uploadService.apiUploadGalleryImagePost(file);
  }
}
