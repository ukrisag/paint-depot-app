import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminProductsService } from '../../services/openapi-client/api/adminProducts.service';
import { ProductsService } from '../../services/openapi-client/api/products.service';
import { CategoriesService } from '../../services/openapi-client/api/categories.service';
import { BrandsService } from '../../services/openapi-client/api/brands.service';
import { CreateProductDto } from '../../services/openapi-client/model/createProductDto';
import { UpdateProductDto } from '../../services/openapi-client/model/updateProductDto';
import { ProductDto } from '../../services/openapi-client/model/productDto';
import { ProductDetailDto } from '../../services/openapi-client/model/productDetailDto';
import { CategoryDto } from '../../services/openapi-client/model/categoryDto';
import { BrandDto } from '../../services/openapi-client/model/brandDto';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  constructor(
    private adminProductsService: AdminProductsService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService
  ) {}

  /**
   * Get all products (admin)
   */
  getProducts(
    pageNumber: number = 1,
    pageSize: number = 20,
    search?: string,
    categoryId?: number,
    brandId?: number,
    isActive?: boolean
  ): Observable<{
    products: ProductDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.adminProductsService.apiAdminProductsGet(
      pageNumber,
      pageSize,
      search,
      categoryId,
      brandId
    ).pipe(
      map(response => {
        const items = response.items || [];
        const filteredItems = isActive !== undefined
          ? items.filter(p => p.isActive === isActive)
          : items;

        return {
          products: filteredItems,
          total: response.totalItems || 0,
          page: response.page || pageNumber,
          pageSize: response.pageSize || pageSize
        };
      })
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Observable<ProductDetailDto | undefined> {
    return this.productsService.apiProductsIdGet(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new product
   */
  createProduct(productDto: CreateProductDto): Observable<ProductDetailDto | undefined> {
    return this.adminProductsService.apiAdminProductsPost(productDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update product
   */
  updateProduct(id: number, productDto: UpdateProductDto): Observable<ProductDetailDto | undefined> {
    return this.adminProductsService.apiAdminProductsIdPut(id, productDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete product
   */
  deleteProduct(id: number): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdDelete(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle product active status
   */
  toggleProductStatus(id: number, isActive: boolean): Observable<ProductDetailDto | undefined> {
    return this.updateProduct(id, { isActive });
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<CategoryDto[]> {
    return this.categoriesService.apiCategoriesGet().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get all brands
   */
  getBrands(): Observable<BrandDto[]> {
    return this.brandsService.apiBrandsGet().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Calculate total stock from variants
   * Note: ProductDto doesn't include variants, so we return 0
   * This is a placeholder - stock info should come from ProductDetailDto or separate API
   */
  calculateTotalStock(product: ProductDto): number {
    // ProductDto doesn't have variants, would need to fetch full product details
    return 0;
  }

  /**
   * Get stock status
   * Note: Since ProductDto doesn't have variant data, this returns a default status
   */
  getStockStatus(product: ProductDto): { text: string; colorClass: string } {
    // Since ProductDto doesn't include stock info, return placeholder
    return { text: 'ดูรายละเอียด', colorClass: 'text-gray-600' };
  }

  /**
   * Upload product image
   */
  uploadProductImage(productId: number, imageUrl: string, isPrimary: boolean, altText: string, displayOrder: number): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdImagesPost(productId, {
      imageUrl,
      isPrimary,
      altText,
      displayOrder
    }).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Update product image
   */
  updateProductImage(productId: number, imageId: number, imageUrl: string, isPrimary: boolean, altText: string, displayOrder: number): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdImagesImageIdPut(productId, imageId, {
      imageUrl,
      isPrimary,
      altText,
      displayOrder
    }).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Delete product image
   */
  deleteProductImage(productId: number, imageId: number): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdImagesImageIdDelete(productId, imageId).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Add product variant
   */
  addProductVariant(productId: number, variant: any): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdVariantsPost(productId, variant).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Update product variant
   */
  updateProductVariant(productId: number, variantId: number, variant: any): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdVariantsVariantIdPut(productId, variantId, variant).pipe(
      map((response: any) => response.data)
    );
  }

  /**
   * Delete product variant
   */
  deleteProductVariant(productId: number, variantId: number): Observable<any> {
    return this.adminProductsService.apiAdminProductsIdVariantsVariantIdDelete(productId, variantId).pipe(
      map((response: any) => response.data)
    );
  }
}
