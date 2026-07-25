import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AdminProductService } from '../../services/admin-product.service';
import { NotificationService } from '../../../services/notification.service';
import { CategoryDto } from '../../../services/openapi-client/model/categoryDto';
import { BrandDto } from '../../../services/openapi-client/model/brandDto';
import { ProductDetailDto } from '../../../services/openapi-client/model/productDetailDto';
import { ImageUploadComponent, ProductImage } from '../../../components/shared/image-upload/image-upload.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './product-form-admin.component.html',
  styleUrls: ['./product-form-admin.component.css']
})
export class ProductFormAdminComponent implements OnInit {
  productForm!: FormGroup;
  categories: CategoryDto[] = [];
  brands: BrandDto[] = [];
  productImages: ProductImage[] = [];

  isEditMode = false;
  productId?: number;
  loading = true;
  submitting = false;
  error = '';

  private originalImages: ProductImage[] = [];
  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private adminProductService: AdminProductService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = parseInt(id, 10);
    }

    this.loadCategories();
    this.loadBrands();

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    } else {
      this.loading = false;
    }
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      shortDescription: ['', [Validators.required, Validators.maxLength(500)]],
      fullDescription: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      compareAtPrice: [null, Validators.min(0)],
      isFeatured: [false],
      isBestseller: [false],
      isNewArrival: [false],
      isActive: [true],
      variants: this.fb.array([])
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  createVariantGroup(variant?: any): FormGroup {
    return this.fb.group({
      id: [variant?.id || null],
      sku: [variant?.sku || '', [Validators.required, Validators.maxLength(100)]],
      name: [variant?.name || '', [Validators.required, Validators.maxLength(200)]],
      sizeValue: [variant?.sizeValue || null, Validators.min(0)],
      sizeUnit: [variant?.sizeUnit || 'L', Validators.maxLength(20)],
      colorName: [variant?.colorName || ''],
      colorCode: [variant?.colorCode || ''],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      compareAtPrice: [variant?.compareAtPrice || null, Validators.min(0)],
      stockQuantity: [variant?.stockQuantity || 0, [Validators.required, Validators.min(0)]],
      isActive: [variant?.isActive !== undefined ? variant.isActive : true],
      weight: [variant?.weight || null, Validators.min(0)]
    });
  }

  addVariant(): void {
    this.variants.push(this.createVariantGroup());
    this.cdr.detectChanges();
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    this.cdr.detectChanges();
  }

  loadCategories(): void {
    this.adminProductService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(c => c.isActive);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.notificationService.error('ไม่สามารถโหลดหมวดหมู่ได้');
        this.cdr.detectChanges();
      }
    });
  }

  loadBrands(): void {
    this.adminProductService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands.filter(b => b.isActive);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading brands:', err);
        this.notificationService.error('ไม่สามารถโหลดแบรนด์ได้');
        this.cdr.detectChanges();
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = '';

    this.adminProductService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.populateForm(product);
        } else {
          this.error = 'ไม่พบสินค้า';
          this.notificationService.error('ไม่พบสินค้า');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลสินค้าได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading product:', err);
      }
    });
  }

  populateForm(product: ProductDetailDto): void {
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      brandId: product.brandId,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
      isNewArrival: product.isNewArrival,
      isActive: product.isActive
    });

    // Populate existing images
    if (product.images && product.images.length > 0) {
      this.productImages = product.images.map(img => ({
        id: img.id,
        url: img.imageUrl || '',
        isPrimary: img.isPrimary || false,
        altText: img.altText || '',
        displayOrder: img.displayOrder || 0
      }));
      // Keep a copy of original images to detect changes
      this.originalImages = JSON.parse(JSON.stringify(this.productImages));
      this.cdr.detectChanges();
    }

    // Populate existing variants
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        this.variants.push(this.createVariantGroup(variant));
      });
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.notificationService.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.submitting = true;
    const formValue = this.productForm.value;

    // Generate slug from name
    const slug = this.generateSlug(formValue.name);

    const productData = {
      ...formValue,
      slug: slug,
      categoryId: formValue.categoryId ? parseInt(formValue.categoryId, 10) : null,
      brandId: formValue.brandId ? parseInt(formValue.brandId, 10) : null,
      basePrice: parseFloat(formValue.basePrice),
      compareAtPrice: formValue.compareAtPrice ? parseFloat(formValue.compareAtPrice) : null
    };

    if (this.isEditMode && this.productId) {
      // Update product, then handle images and variants
      this.adminProductService.updateProduct(this.productId, productData).pipe(
        switchMap(() => this.handleImageUpdates(this.productId!)),
        switchMap(() => this.handleVariantUpdates(this.productId!))
      ).subscribe({
        next: () => {
          this.notificationService.success('บันทึกข้อมูลสินค้าเรียบร้อยแล้ว');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถบันทึกข้อมูลสินค้าได้');
          this.submitting = false;
          console.error('Error updating product:', err);
        }
      });
    } else {
      // Create product, then handle images and variants
      this.adminProductService.createProduct(productData).pipe(
        switchMap((product: any) => {
          if (product && product.id) {
            this.productId = product.id;
            return this.handleImageUpdates(product.id);
          }
          return of(null);
        }),
        switchMap(() => {
          if (this.productId) {
            return this.handleVariantUpdates(this.productId);
          }
          return of(null);
        })
      ).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มสินค้าเรียบร้อยแล้ว');
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถเพิ่มสินค้าได้');
          this.submitting = false;
          console.error('Error creating product:', err);
        }
      });
    }
  }

  private handleImageUpdates(productId: number) {
    const operations: any[] = [];

    // 1. Upload new images (images with file but no id)
    const newImages = this.productImages.filter(img => img.file && !img.id);
    newImages.forEach((img, index) => {
      const uploadOp = this.uploadImageFile(img.file!).pipe(
        switchMap(imageUrl =>
          this.adminProductService.uploadProductImage(
            productId,
            imageUrl,
            img.isPrimary,
            img.altText,
            index
          )
        ),
        catchError(err => {
          console.error('Error uploading image:', err);
          return of(null);
        })
      );
      operations.push(uploadOp);
    });

    // 2. Update existing images
    const existingImages = this.productImages.filter(img => img.id && !img.file);
    existingImages.forEach((img, index) => {
      const original = this.originalImages.find(o => o.id === img.id);
      // Check if anything changed
      if (!original ||
          original.isPrimary !== img.isPrimary ||
          original.altText !== img.altText ||
          original.displayOrder !== img.displayOrder) {
        const updateOp = this.adminProductService.updateProductImage(
          productId,
          img.id!,
          img.url,
          img.isPrimary,
          img.altText,
          index
        ).pipe(
          catchError(err => {
            console.error('Error updating image:', err);
            return of(null);
          })
        );
        operations.push(updateOp);
      }
    });

    // 3. Delete removed images
    const currentImageIds = this.productImages.filter(img => img.id).map(img => img.id);
    const deletedImages = this.originalImages.filter(img => !currentImageIds.includes(img.id));
    deletedImages.forEach(img => {
      if (img.id) {
        const deleteOp = this.adminProductService.deleteProductImage(productId, img.id).pipe(
          catchError(err => {
            console.error('Error deleting image:', err);
            return of(null);
          })
        );
        operations.push(deleteOp);
      }
    });

    // If no operations, just return success
    if (operations.length === 0) {
      return of(true);
    }

    return forkJoin(operations);
  }

  private handleVariantUpdates(productId: number) {
    const operations: any[] = [];
    const formVariants = this.variants.value;

    // Get existing variant IDs from the form
    const existingVariantIds = formVariants
      .filter((v: any) => v.id)
      .map((v: any) => v.id);

    // 1. Add new variants (variants without id)
    const newVariants = formVariants.filter((v: any) => !v.id);
    newVariants.forEach((variant: any) => {
      const createOp = this.adminProductService.addProductVariant(productId, {
        sku: variant.sku,
        name: variant.name,
        colorName: variant.colorName || null,
        colorCode: variant.colorCode || null,
        sizeValue: variant.sizeValue || null,
        sizeUnit: variant.sizeUnit || 'L',
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
        stockQuantity: parseInt(variant.stockQuantity, 10),
        isActive: variant.isActive,
        weight: variant.weight ? parseFloat(variant.weight) : null
      }).pipe(
        catchError(err => {
          console.error('Error creating variant:', err);
          this.notificationService.error(`ไม่สามารถเพิ่ม variant "${variant.name}" ได้`);
          return of(null);
        })
      );
      operations.push(createOp);
    });

    // 2. Update existing variants
    const existingVariants = formVariants.filter((v: any) => v.id);
    existingVariants.forEach((variant: any) => {
      const updateOp = this.adminProductService.updateProductVariant(productId, variant.id, {
        sku: variant.sku,
        name: variant.name,
        colorName: variant.colorName || null,
        colorCode: variant.colorCode || null,
        sizeValue: variant.sizeValue || null,
        sizeUnit: variant.sizeUnit || 'L',
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
        stockQuantity: parseInt(variant.stockQuantity, 10),
        isActive: variant.isActive,
        weight: variant.weight ? parseFloat(variant.weight) : null
      }).pipe(
        catchError(err => {
          console.error('Error updating variant:', err);
          this.notificationService.error(`ไม่สามารถอัปเดต variant "${variant.name}" ได้`);
          return of(null);
        })
      );
      operations.push(updateOp);
    });

    // If no operations, just return success
    if (operations.length === 0) {
      return of(true);
    }

    return forkJoin(operations);
  }

  private uploadImageFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/api/upload/product-image`, formData).pipe(
      switchMap((response) => {
        if (response.success && response.data) {
          return of(response.data);
        }
        throw new Error(response.message || 'Failed to upload file');
      })
    );
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['maxLength']) return `ความยาวสูงสุด ${field.errors['maxLength'].requiredLength} ตัวอักษร`;
    if (field.errors['min']) return `ค่าต่ำสุดคือ ${field.errors['min'].min}`;

    return 'ข้อมูลไม่ถูกต้อง';
  }

  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) return '';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  getBrandName(brandId: number | null | undefined): string {
    if (!brandId) return '';
    const brand = this.brands.find(b => b.id === brandId);
    return brand?.name || '';
  }

  onImagesChange(images: ProductImage[]): void {
    this.productImages = images;
    console.log('Product images updated:', images);
    // Note: You'll need to upload these images to your server when saving the product
    // For now, we're just storing the image URLs
  }
}
