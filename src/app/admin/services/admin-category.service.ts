import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoriesService } from '../../services/openapi-client/api/categories.service';
import { CreateCategoryDto } from '../../services/openapi-client/model/createCategoryDto';
import { CategoryDto } from '../../services/openapi-client/model/categoryDto';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {

  constructor(
    private categoriesService: CategoriesService
  ) {}

  /**
   * Get all categories (including inactive)
   */
  getCategories(includeInactive: boolean = true): Observable<CategoryDto[]> {
    return this.categoriesService.apiCategoriesGet(includeInactive).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Observable<CategoryDto | undefined> {
    return this.categoriesService.apiCategoriesIdGet(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new category
   */
  createCategory(categoryDto: CreateCategoryDto): Observable<CategoryDto | undefined> {
    return this.categoriesService.apiCategoriesPost(categoryDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update category
   */
  updateCategory(id: number, categoryDto: CreateCategoryDto): Observable<CategoryDto | undefined> {
    return this.categoriesService.apiCategoriesIdPut(id, categoryDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete category
   */
  deleteCategory(id: number): Observable<any> {
    return this.categoriesService.apiCategoriesIdDelete(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle category active status
   */
  toggleCategoryStatus(id: number, category: CategoryDto): Observable<CategoryDto | undefined> {
    const updateDto: CreateCategoryDto = {
      name: category.name || '',
      slug: category.slug || '',
      parentId: category.parentId,
      description: category.description,
      imageUrl: category.imageUrl,
      displayOrder: category.displayOrder,
      isActive: !category.isActive
    };
    return this.updateCategory(id, updateDto);
  }

  /**
   * Build hierarchical tree from flat category list
   */
  buildCategoryTree(categories: CategoryDto[]): CategoryDto[] {
    const categoryMap = new Map<number, CategoryDto>();
    const rootCategories: CategoryDto[] = [];

    // First pass: Create map of all categories
    categories.forEach(cat => {
      if (cat.id !== undefined) {
        categoryMap.set(cat.id, { ...cat, subCategories: [] });
      }
    });

    // Second pass: Build tree structure
    categories.forEach(cat => {
      if (cat.id !== undefined) {
        const category = categoryMap.get(cat.id);
        if (category) {
          if (category.parentId === null || category.parentId === undefined) {
            rootCategories.push(category);
          } else {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
              if (!parent.subCategories) {
                parent.subCategories = [];
              }
              parent.subCategories.push(category);
            } else {
              // Parent not found, treat as root
              rootCategories.push(category);
            }
          }
        }
      }
    });

    return rootCategories;
  }

  /**
   * Flatten category tree to list with level information
   */
  flattenCategoryTree(categories: CategoryDto[], level: number = 0): Array<CategoryDto & { level: number }> {
    let result: Array<CategoryDto & { level: number }> = [];

    categories.forEach(category => {
      result.push({ ...category, level });

      if (category.subCategories && category.subCategories.length > 0) {
        const children = this.flattenCategoryTree(category.subCategories, level + 1);
        result = result.concat(children);
      }
    });

    return result;
  }

  /**
   * Generate slug from name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/[^\w\u0E00-\u0E7F-]+/g, '') // Remove non-word chars except Thai characters
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // Remove leading hyphens
      .replace(/-+$/, ''); // Remove trailing hyphens
  }
}
