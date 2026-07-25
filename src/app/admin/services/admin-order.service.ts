import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminOrdersService } from '../../services/openapi-client/api/adminOrders.service';
import { OrderDto } from '../../services/openapi-client/model/orderDto';
import { OrderDetailDto } from '../../services/openapi-client/model/orderDetailDto';
import { UpdateOrderStatusDto } from '../../services/openapi-client/model/updateOrderStatusDto';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  constructor(private adminOrdersService: AdminOrdersService) {}

  /**
   * Get all orders (admin can see all orders)
   */
  getAllOrders(pageNumber: number = 1, pageSize: number = 20): Observable<{
    data: OrderDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.adminOrdersService.apiAdminOrdersGet(pageNumber, pageSize).pipe(
      map(response => {
        const data = response.data;
        return {
          data: data || [],
          total: data?.length || 0,
          page: pageNumber,
          pageSize: pageSize
        };
      })
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(id: number): Observable<OrderDetailDto | undefined> {
    return this.adminOrdersService.apiAdminOrdersIdGet(id).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update order status
   */
  updateOrderStatus(id: number, statusDto: UpdateOrderStatusDto): Observable<OrderDetailDto | undefined> {
    return this.adminOrdersService.apiAdminOrdersIdStatusPut(id, statusDto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get sales analytics
   */
  getSalesAnalytics(startDate?: string, endDate?: string): Observable<any> {
    return this.adminOrdersService.apiAdminOrdersAnalyticsSalesGet(startDate, endDate).pipe(
      map(response => response.data)
    );
  }
}
