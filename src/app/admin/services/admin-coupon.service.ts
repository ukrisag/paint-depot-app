import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminCouponsService } from '../../services/openapi-client/api/adminCoupons.service';
import { CouponsService } from '../../services/openapi-client/api/coupons.service';
import { CouponDto } from '../../services/openapi-client/model/couponDto';
import { CreateCouponDto } from '../../services/openapi-client/model/createCouponDto';

@Injectable({
  providedIn: 'root'
})
export class AdminCouponService {

  constructor(
    private adminCouponsService: AdminCouponsService,
    private couponsService: CouponsService
  ) {}

  /**
   * Get all coupons (both active and inactive)
   */
  getCoupons(): Observable<CouponDto[]> {
    return this.couponsService.apiCouponsAvailableGet().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get coupon by ID
   */
  getCouponById(id: number): Observable<CouponDto | undefined> {
    // Note: The API doesn't have a specific GET endpoint for single coupon
    // We'll fetch all and filter, or you can implement a dedicated endpoint
    return this.getCoupons().pipe(
      map(coupons => coupons.find(c => c.id === id))
    );
  }

  /**
   * Create a new coupon
   */
  createCoupon(couponData: CreateCouponDto): Observable<CouponDto | undefined> {
    return this.adminCouponsService.apiAdminCouponsPost(couponData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update an existing coupon
   */
  updateCoupon(id: number, couponData: CreateCouponDto): Observable<CouponDto | undefined> {
    return this.adminCouponsService.apiAdminCouponsIdPut(id, couponData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a coupon
   */
  deleteCoupon(id: number): Observable<any> {
    return this.adminCouponsService.apiAdminCouponsIdDelete(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle coupon active status
   */
  toggleCouponStatus(id: number, coupon: CouponDto): Observable<CouponDto | undefined> {
    const updateData: CreateCouponDto = {
      code: coupon.code || '',
      type: coupon.type || '',
      value: coupon.value || 0,
      minPurchaseAmount: coupon.minPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimitTotal: coupon.usageLimitTotal,
      usageLimitPerUser: coupon.usageLimitPerUser,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: !coupon.isActive
    };

    return this.updateCoupon(id, updateData);
  }
}
