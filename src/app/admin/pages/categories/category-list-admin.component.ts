import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCategoryService } from '../../services/admin-category.service';
import { NotificationService } from '../../../services/notification.service';
import { CategoryDto } from '../../../services/openapi-client/model/categoryDto';
import { CreateCategoryDto } from '../../../services/openapi-client/model/createCategoryDto';

interface CategoryWithLevel extends CategoryDto {
  level: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

@Component({
  selector: 'app-category-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list-admin.component.html',
  styleUrls: ['./category-list-admin.component.css']
})
export class CategoryListAdminComponent implements OnInit {
  categories: CategoryWithLevel[] = [];
  allCategories: CategoryDto[] = [];
  parentCategories: CategoryDto[] = [];

  loading = true;
  error = '';

  // Modal state
  showModal = false;
  isEditMode = false;
  editingCategoryId?: number;

  // Form data
  formData: CategoryFormData = {
    name: '',
    slug: '',
    parentId: null,
    description: '',
    displayOrder: 0,
    isActive: true
  };

  // Delete confirmation
  categoryToDelete?: CategoryDto;
  showDeleteConfirm = false;

  // Filter
  showInactive = true;

  constructor(
    private adminCategoryService: AdminCategoryService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.adminCategoryService.getCategories(this.showInactive).subscribe({
      next: (categories) => {
        this.allCategories = categories;

        // Filter active/inactive based on toggle
        const filteredCategories = this.showInactive
          ? categories
          : categories.filter(c => c.isActive);

        // Build tree and flatten for display
        const tree = this.adminCategoryService.buildCategoryTree(filteredCategories);
        this.categories = this.adminCategoryService.flattenCategoryTree(tree);

        // Get parent categories (root level only) for dropdown
        this.parentCategories = categories.filter(c =>
          (c.parentId === null || c.parentId === undefined) && c.isActive
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading categories:', err);
      }
    });
  }

  onFilterChange(): void {
    this.loadCategories();
  }

  onAddNew(): void {
    this.isEditMode = false;
    this.editingCategoryId = undefined;
    this.formData = {
      name: '',
      slug: '',
      parentId: null,
      description: '',
      displayOrder: 0,
      isActive: true
    };
    this.showModal = true;
  }

  onEdit(category: CategoryDto): void {
    if (!category.id) return;

    this.isEditMode = true;
    this.editingCategoryId = category.id;
    this.formData = {
      name: category.name || '',
      slug: category.slug || '',
      parentId: category.parentId || null,
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive ?? true
    };
    this.showModal = true;
  }

  onDeleteClick(category: CategoryDto): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.categoryToDelete?.id) return;

    this.adminCategoryService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('ลบหมวดหมู่เรียบร้อยแล้ว');
        this.showDeleteConfirm = false;
        this.categoryToDelete = undefined;
        this.loadCategories();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถลบหมวดหมู่ได้ อาจมีสินค้าอยู่ในหมวดหมู่นี้');
        this.cdr.detectChanges();
        console.error('Error deleting category:', err);
      }
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = undefined;
  }

  onToggleStatus(category: CategoryDto): void {
    if (!category.id) return;

    this.adminCategoryService.toggleCategoryStatus(category.id, category).subscribe({
      next: () => {
        const newStatus = !category.isActive;
        this.notificationService.success(
          newStatus ? 'เปิดใช้งานหมวดหมู่แล้ว' : 'ปิดใช้งานหมวดหมู่แล้ว'
        );
        this.loadCategories();
      },
      error: (err) => {
        this.notificationService.error('ไม่สามารถเปลี่ยนสถานะหมวดหมู่ได้');
        this.cdr.detectChanges();
        console.error('Error toggling category status:', err);
      }
    });
  }

  onNameChange(): void {
    if (!this.isEditMode || !this.formData.slug) {
      this.formData.slug = this.adminCategoryService.generateSlug(this.formData.name);
    }
  }

  onSaveCategory(): void {
    // Validate
    if (!this.formData.name.trim()) {
      this.notificationService.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    if (!this.formData.slug.trim()) {
      this.notificationService.error('กรุณากรอก Slug');
      return;
    }

    const categoryDto: CreateCategoryDto = {
      name: this.formData.name.trim(),
      slug: this.formData.slug.trim(),
      parentId: this.formData.parentId,
      description: this.formData.description.trim() || null,
      displayOrder: this.formData.displayOrder,
      isActive: this.formData.isActive
    };

    if (this.isEditMode && this.editingCategoryId) {
      // Update
      this.adminCategoryService.updateCategory(this.editingCategoryId, categoryDto).subscribe({
        next: () => {
          this.notificationService.success('แก้ไขหมวดหมู่เรียบร้อยแล้ว');
          this.showModal = false;
          this.loadCategories();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถแก้ไขหมวดหมู่ได้');
          this.cdr.detectChanges();
          console.error('Error updating category:', err);
        }
      });
    } else {
      // Create
      this.adminCategoryService.createCategory(categoryDto).subscribe({
        next: () => {
          this.notificationService.success('เพิ่มหมวดหมู่เรียบร้อยแล้ว');
          this.showModal = false;
          this.loadCategories();
        },
        error: (err) => {
          this.notificationService.error('ไม่สามารถเพิ่มหมวดหมู่ได้');
          this.cdr.detectChanges();
          console.error('Error creating category:', err);
        }
      });
    }
  }

  onCancelModal(): void {
    this.showModal = false;
    this.formData = {
      name: '',
      slug: '',
      parentId: null,
      description: '',
      displayOrder: 0,
      isActive: true
    };
  }

  getIndentation(level: number): string {
    return '—'.repeat(level) + (level > 0 ? ' ' : '');
  }

  getParentName(parentId: number | null | undefined): string {
    if (!parentId) return '-';
    const parent = this.allCategories.find(c => c.id === parentId);
    return parent?.name || '-';
  }

  canDelete(category: CategoryDto): boolean {
    // Can't delete if it has products or subcategories
    return (category.productCount || 0) === 0 &&
           (!category.subCategories || category.subCategories.length === 0);
  }

  getAvailableParentCategories(): CategoryDto[] {
    if (!this.isEditMode) {
      return this.parentCategories;
    }

    // When editing, exclude the category itself and its descendants
    return this.parentCategories.filter(c => c.id !== this.editingCategoryId);
  }
}
