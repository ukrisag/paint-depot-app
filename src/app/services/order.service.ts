import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdersService } from './openapi-client/api/orders.service';
import {
  CreateOrderDto,
  OrderDto,
  OrderDetailDto
} from './openapi-client/model/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(
    private apiOrdersService: OrdersService,
    private http: HttpClient
  ) {}

  createOrder(orderData: CreateOrderDto): Observable<OrderDetailDto> {
    return this.apiOrdersService.apiOrdersPost(orderData).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create order');
      })
    );
  }

  getMyOrders(): Observable<OrderDto[]> {
    return this.apiOrdersService.apiOrdersGet().pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to get orders');
      })
    );
  }

  getOrderById(id: number): Observable<OrderDetailDto> {
    return this.apiOrdersService.apiOrdersIdGet(id).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to get order');
      })
    );
  }

  cancelOrder(id: number): Observable<void> {
    return this.apiOrdersService.apiOrdersIdCancelPut(id).pipe(
      map((response: any) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to cancel order');
        }
      })
    );
  }

  uploadPaymentSlip(id: number, paymentSlipUrl: string): Observable<OrderDetailDto> {
    return this.apiOrdersService.apiOrdersIdPaymentSlipPut(id, { paymentSlipUrl }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to upload payment slip');
      })
    );
  }

  uploadPaymentSlipFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/api/upload/payment-slip`, formData).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to upload file');
      })
    );
  }
}
