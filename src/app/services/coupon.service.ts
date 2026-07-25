import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CouponsService } from './openapi-client/api/coupons.service';
import { CouponDto } from './openapi-client/model/models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  constructor(private apiCouponsService: CouponsService) {}

  validateCoupon(code: string, orderTotal: number): Observable<any> {
    return this.apiCouponsService.apiCouponsValidatePost({ code, subtotal: orderTotal }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Coupon is not valid');
      })
    );
  }

  getAvailableCoupons(): Observable<CouponDto[]> {
    return this.apiCouponsService.apiCouponsAvailableGet().pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to get available coupons');
      })
    );
  }

  calculateDiscount(coupon: CouponDto, orderTotal: number): number {
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
      const discount = (orderTotal * (coupon.value || 0)) / 100;
      return Math.min(discount, coupon.maxDiscountAmount || discount);
    } else if (coupon.type === 'fixed_amount') {
      return coupon.value || 0;
    } else if (coupon.type === 'free_shipping') {
      return 0; // Free shipping doesn't affect subtotal
    }
    return 0;
  }
}
