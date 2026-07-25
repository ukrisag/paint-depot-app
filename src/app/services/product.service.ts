import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, Category, Brand, ProductFilters } from '../models/product.model';
import { ProductsService } from './openapi-client/api/products.service';
import { CategoriesService } from './openapi-client/api/categories.service';
import { BrandsService } from './openapi-client/api/brands.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService
  ) {}

  /**
   * Get all products with optional filters
   */
  getProducts(filters?: ProductFilters): Observable<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const pageSize = filters?.limit || 12;

    return this.productsService.apiProductsGet(
      page,
      pageSize,
      filters?.search,
      filters?.categoryId,
      filters?.brandId,
      filters?.isFeatured,
      filters?.isBestseller,
      filters?.isNewArrival,
      filters?.minPrice,
      filters?.maxPrice,
      filters?.sortBy
    ).pipe(
      map(response => {
        const data = response.data;
        const items = data?.items || [];

        const products: Product[] = items.map(item => this.transformProductDto(item));

        return {
          products,
          total: data?.totalItems || 0,
          page: data?.page || 1,
          limit: data?.pageSize || pageSize
        };
      })
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.productsService.apiProductsIdGet(id).pipe(
      map(response => {
        if (response.data) {
          return this.transformProductDetailDto(response.data);
        }
        return undefined;
      })
    );
  }

  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.productsService.apiProductsSlugSlugGet(slug).pipe(
      map(response => {
        if (response.data) {
          return this.transformProductDetailDto(response.data);
        }
        return undefined;
      })
    );
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit: number = 8): Observable<Product[]> {
    return this.productsService.apiProductsGet(
      1,
      limit,
      undefined,
      undefined,
      undefined,
      true, // isFeatured
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ).pipe(
      map(response => {
        const items = response.data?.items || [];
        return items.map(item => this.transformProductDto(item));
      })
    );
  }

  /**
   * Get bestseller products
   */
  getBestsellerProducts(limit: number = 8): Observable<Product[]> {
    return this.productsService.apiProductsGet(
      1,
      limit,
      undefined,
      undefined,
      undefined,
      undefined,
      true, // isBestseller
      undefined,
      undefined,
      undefined,
      undefined
    ).pipe(
      map(response => {
        const items = response.data?.items || [];
        return items.map(item => this.transformProductDto(item));
      })
    );
  }

  /**
   * Get new arrival products
   */
  getNewArrivalProducts(limit: number = 8): Observable<Product[]> {
    return this.productsService.apiProductsGet(
      1,
      limit,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true, // isNewArrival
      undefined,
      undefined,
      undefined
    ).pipe(
      map(response => {
        const items = response.data?.items || [];
        return items.map(item => this.transformProductDto(item));
      })
    );
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.categoriesService.apiCategoriesGet().pipe(
      map(response => {
        const items = response.data || [];
        return items.map(item => this.transformCategoryDto(item));
      })
    );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Observable<Category | undefined> {
    return this.categoriesService.apiCategoriesIdGet(id).pipe(
      map(response => {
        if (response.data) {
          return this.transformCategoryDto(response.data);
        }
        return undefined;
      })
    );
  }

  /**
   * Get all brands
   */
  getBrands(): Observable<Brand[]> {
    return this.brandsService.apiBrandsGet().pipe(
      map(response => {
        const items = response.data || [];
        return items.map(item => this.transformBrandDto(item));
      })
    );
  }

  /**
   * Get brand by ID
   */
  getBrandById(id: number): Observable<Brand | undefined> {
    return this.brandsService.apiBrandsIdGet(id).pipe(
      map(response => {
        if (response.data) {
          return this.transformBrandDto(response.data);
        }
        return undefined;
      })
    );
  }

  /**
   * Search products
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.productsService.apiProductsGet(
      1,
      100, // Get more results for search
      query,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ).pipe(
      map(response => {
        const items = response.data?.items || [];
        return items.map(item => this.transformProductDto(item));
      })
    );
  }

  /**
   * Transform ProductDto to Product model
   */
  private transformProductDto(dto: any): Product {
    return {
      id: dto.id || 0,
      categoryId: dto.categoryId || 0,
      brandId: dto.brandId || 0,
      sku: dto.sku || '',
      name: dto.name || '',
      slug: dto.slug || '',
      shortDescription: dto.shortDescription || '',
      fullDescription: '',
      basePrice: dto.basePrice || 0,
      compareAtPrice: dto.compareAtPrice,
      isFeatured: dto.isFeatured || false,
      isBestseller: dto.isBestseller || false,
      isNewArrival: dto.isNewArrival || false,
      isActive: dto.isActive || false,
      averageRating: dto.averageRating,
      reviewCount: dto.reviewCount || 0,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      images: dto.primaryImage ? [{
        id: 0,
        productId: dto.id || 0,
        imageUrl: dto.primaryImage,
        displayOrder: 0,
        isPrimary: true,
        createdAt: new Date()
      }] : []
    };
  }

  /**
   * Transform ProductDetailDto to Product model
   */
  private transformProductDetailDto(dto: any): Product {
    // Parse features if it's a JSON string
    let features: string[] | undefined;
    if (dto.features) {
      try {
        features = JSON.parse(dto.features);
      } catch {
        features = undefined;
      }
    }

    // Parse specifications if it's a JSON string
    let specifications: Record<string, any> | undefined;
    if (dto.specifications) {
      try {
        specifications = JSON.parse(dto.specifications);
      } catch {
        specifications = undefined;
      }
    }

    return {
      id: dto.id || 0,
      categoryId: dto.categoryId || 0,
      brandId: dto.brandId || 0,
      sku: dto.sku || '',
      name: dto.name || '',
      slug: dto.slug || '',
      shortDescription: dto.shortDescription || '',
      fullDescription: dto.fullDescription || '',
      features,
      specifications,
      usageInstructions: dto.usageInstructions,
      warnings: dto.warnings,
      standardCertification: dto.standardCertification,
      coverageAreaPerLiter: dto.coverageAreaPerLiter,
      basePrice: dto.basePrice || 0,
      compareAtPrice: dto.compareAtPrice,
      isFeatured: dto.isFeatured || false,
      isBestseller: dto.isBestseller || false,
      isNewArrival: dto.isNewArrival || false,
      isActive: dto.isActive || false,
      averageRating: dto.averageRating,
      reviewCount: dto.reviewCount || 0,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      images: dto.images?.map((img: any) => ({
        id: img.id || 0,
        productId: dto.id || 0,
        imageUrl: img.imageUrl || '',
        altText: img.altText,
        displayOrder: img.displayOrder || 0,
        isPrimary: img.isPrimary || false,
        createdAt: img.createdAt ? new Date(img.createdAt) : new Date()
      })) || [],
      variants: dto.variants?.map((variant: any) => ({
        id: variant.id || 0,
        productId: dto.id || 0,
        sku: variant.sku || '',
        name: variant.name || '',
        sizeValue: variant.sizeValue || 0,
        sizeUnit: variant.sizeUnit || '',
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        price: variant.price || 0,
        compareAtPrice: variant.compareAtPrice,
        stockQuantity: variant.stockQuantity || 0,
        lowStockThreshold: variant.lowStockThreshold || 0,
        weight: variant.weight,
        dimensions: variant.dimensions,
        isActive: variant.isActive || false,
        createdAt: variant.createdAt ? new Date(variant.createdAt) : new Date(),
        updatedAt: variant.updatedAt ? new Date(variant.updatedAt) : new Date()
      })) || []
    };
  }

  /**
   * Transform CategoryDto to Category model
   */
  private transformCategoryDto(dto: any): Category {
    return {
      id: dto.id || 0,
      parentId: dto.parentId,
      name: dto.name || '',
      slug: dto.slug || '',
      description: dto.description,
      imageUrl: dto.imageUrl,
      displayOrder: dto.displayOrder || 0,
      isActive: dto.isActive || false,
      children: dto.subCategories?.map((sub: any) => this.transformCategoryDto(sub)) || [],
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.createdAt ? new Date(dto.createdAt) : new Date()
    };
  }

  /**
   * Transform BrandDto to Brand model
   */
  private transformBrandDto(dto: any): Brand {
    return {
      id: dto.id || 0,
      name: dto.name || '',
      slug: dto.slug || '',
      logoUrl: dto.logoUrl,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isActive: dto.isActive || false,
      displayOrder: dto.displayOrder || 0,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.createdAt ? new Date(dto.createdAt) : new Date()
    };
  }
}
