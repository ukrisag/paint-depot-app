import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminOrderService } from '../../services/admin-order.service';
import { AdminUserService } from '../../services/admin-user.service';
import { ProductService } from '../../../services/product.service';
import { OrderDto } from '../../../services/openapi-client';
import { forkJoin } from 'rxjs';

interface DashboardStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface SalesChartData {
  date: string;
  amount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private adminOrderService = inject(AdminOrderService);
  private adminUserService = inject(AdminUserService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  stats: DashboardStat[] = [
    {
      title: 'ยอดขายวันนี้',
      value: '฿0',
      icon: '💰',
      color: 'bg-blue-500'
    },
    {
      title: 'คำสั่งซื้อใหม่',
      value: '0',
      icon: '🛒',
      color: 'bg-green-500'
    },
    {
      title: 'สินค้าทั้งหมด',
      value: '0',
      icon: '📦',
      color: 'bg-purple-500'
    },
    {
      title: 'ผู้ใช้งาน',
      value: '0',
      icon: '👥',
      color: 'bg-orange-500'
    }
  ];

  recentOrders: OrderDto[] = [];
  salesChartData: SalesChartData[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    forkJoin({
      orders: this.adminOrderService.getAllOrders(1, 100),
      users: this.adminUserService.getUsers(1, 100),
      products: this.productService.getProducts({ page: 1, limit: 1 })
    }).subscribe({
      next: (data) => {
        console.log('Dashboard data loaded:', data);
        const allOrders: OrderDto[] = (data.orders as any)?.data || [];
        const totalUsers = (data.users as any)?.total || 0;
        const totalProducts = data.products.total || 0;

        console.log('All orders:', allOrders);
        console.log('Total users:', totalUsers);
        console.log('Total products:', totalProducts);

        // Calculate today's sales (excluding cancelled orders)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = allOrders.filter((order: OrderDto) => {
          const orderDate = new Date(order.createdAt || '');
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime() && order.status !== 'cancelled';
        });
        const todaySales = todayOrders.reduce((sum: number, order: OrderDto) => sum + (order.totalAmount || 0), 0);

        // Calculate new orders (today, excluding cancelled)
        const newOrders = todayOrders.length;

        // Update stats
        this.stats = [
          {
            title: 'ยอดขายวันนี้',
            value: `฿${todaySales.toLocaleString('th-TH')}`,
            icon: '💰',
            color: 'bg-blue-500'
          },
          {
            title: 'คำสั่งซื้อใหม่',
            value: newOrders.toString(),
            icon: '🛒',
            color: 'bg-green-500'
          },
          {
            title: 'สินค้าทั้งหมด',
            value: totalProducts.toString(),
            icon: '📦',
            color: 'bg-purple-500'
          },
          {
            title: 'ผู้ใช้งาน',
            value: totalUsers.toString(),
            icon: '👥',
            color: 'bg-orange-500'
          }
        ];

        // Get recent orders (last 5)
        this.recentOrders = allOrders
          .sort((a: OrderDto, b: OrderDto) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        // Generate sales chart data (last 7 days)
        this.salesChartData = this.generateSalesChartData(allOrders);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateSalesChartData(orders: OrderDto[]): SalesChartData[] {
    const chartData: SalesChartData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter((order: OrderDto) => {
        const orderDate = new Date(order.createdAt || '');
        return orderDate >= date && orderDate < nextDate && order.status !== 'cancelled';
      });

      const dayTotal = dayOrders.reduce((sum: number, order: OrderDto) => sum + (order.totalAmount || 0), 0);

      chartData.push({
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        amount: dayTotal
      });
    }

    return chartData;
  }

  getMaxChartValue(): number {
    if (this.salesChartData.length === 0) return 0;
    const max = Math.max(...this.salesChartData.map(d => d.amount));
    return max > 0 ? max : 100;
  }

  getBarHeight(amount: number): number {
    const max = this.getMaxChartValue();
    return max > 0 ? (amount / max) * 100 : 0;
  }

  getOrderStatusClass(status?: string): string {
    switch (status) {
      case 'pending':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOrderStatusText(status?: string): string {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'pending_payment':
        return 'รอชำระเงิน';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'processing':
        return 'กำลังเตรียมสินค้า';
      case 'shipped':
        return 'จัดส่งแล้ว';
      case 'delivered':
        return 'จัดส่งสำเร็จ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status || 'ไม่ทราบ';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
