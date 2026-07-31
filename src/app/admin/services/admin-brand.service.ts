import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrandsService } from '../../services/openapi-client/api/brands.service';
import { BrandDto } from '../../services/openapi-client/model/brandDto';
import { CreateBrandDto } from '../../services/openapi-client/model/createBrandDto';

@Injectable({
  providedIn: 'root'
})
export class AdminBrandService {

  constructor(
    private brandsService: BrandsService
  ) {}

  /**
   * Get all brands (including inactive)
   */
  getBrands(includeInactive: boolean = true): Observable<BrandDto[]> {
    return this.brandsService.apiBrandsGet(includeInactive).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get brand by ID
   */
  getBrandById(id: number): Observable<BrandDto | undefined> {
    return this.brandsService.apiBrandsIdGet(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create new brand
   */
  createBrand(brandDto: CreateBrandDto): Observable<BrandDto | undefined> {
    return this.brandsService.apiBrandsPost(brandDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update brand
   */
  updateBrand(id: number, brandDto: CreateBrandDto): Observable<BrandDto | undefined> {
    return this.brandsService.apiBrandsIdPut(id, brandDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete brand
   */
  deleteBrand(id: number): Observable<any> {
    return this.brandsService.apiBrandsIdDelete(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle brand active status
   */
  toggleBrandStatus(id: number, brand: BrandDto, newStatus: boolean): Observable<BrandDto | undefined> {
    const updateDto: CreateBrandDto = {
      name: brand.name || '',
      slug: brand.slug || '',
      logoUrl: brand.logoUrl,
      description: brand.description,
      websiteUrl: brand.websiteUrl,
      isActive: newStatus,
      displayOrder: brand.displayOrder
    };
    return this.updateBrand(id, updateDto);
  }

  /**
   * Generate slug from name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
