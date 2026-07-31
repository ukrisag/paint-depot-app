import { Component, OnInit, inject, signal } from '@angular/core';
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

interface OrderStatusData {
  status: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
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

  loading = signal(true);
  stats = signal<DashboardStat[]>([
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
  ]);

  recentOrders = signal<OrderDto[]>([]);
  salesChartData = signal<SalesChartData[]>([]);
  orderStatusData = signal<OrderStatusData[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);

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
        this.stats.set([
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
        ]);

        // Get recent orders (last 5)
        this.recentOrders.set(allOrders
          .sort((a: OrderDto, b: OrderDto) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5));

        // Generate sales chart data (last 7 days)
        const chartData = this.generateSalesChartData(allOrders);
        console.log('Sales chart data:', chartData);
        this.salesChartData.set(chartData);

        // Generate order status data
        const statusData = this.generateOrderStatusData(allOrders);
        console.log('Order status data:', statusData);
        this.orderStatusData.set(statusData);

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading.set(false);
      }
    });
  }

  generateSalesChartData(orders: OrderDto[]): SalesChartData[] {
    const chartData: SalesChartData[] = [];
    const today = new Date();

    // Statuses that mean payment is completed
    const paidStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Filter only paid orders (not pending, pending_payment, or cancelled)
      const dayOrders = orders.filter((order: OrderDto) => {
        const orderDate = new Date(order.createdAt || '');
        const isInDateRange = orderDate >= date && orderDate < nextDate;
        const isPaid = paidStatuses.includes(order.status?.toLowerCase() || '');

        return isInDateRange && isPaid;
      });

      const dayTotal = dayOrders.reduce((sum: number, order: OrderDto) => sum + (order.totalAmount || 0), 0);

      chartData.push({
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        amount: dayTotal
      });
    }

    console.log('Paid statuses used:', paidStatuses);
    return chartData;
  }

  getMaxChartValue(): number {
    if (this.salesChartData().length === 0) return 0;
    const max = Math.max(...this.salesChartData().map(d => d.amount));
    return max > 0 ? max : 100;
  }

  getBarHeight(amount: number): number {
    const max = this.getMaxChartValue();
    if (max === 0) return 0;

    // Calculate percentage
    let percentage = (amount / max) * 100;

    // If amount > 0 but percentage is too small, show minimum 8%
    if (amount > 0 && percentage < 8) {
      percentage = 8;
    }

    console.log(`Bar height for amount ${amount}: ${percentage}% (max: ${max})`);
    return percentage;
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

  generateOrderStatusData(orders: OrderDto[]): OrderStatusData[] {
    const statusConfig = [
      { status: 'pending', label: 'รอดำเนินการ', color: 'bg-yellow-500' },
      { status: 'pending_payment', label: 'รอชำระเงิน', color: 'bg-orange-500' },
      { status: 'confirmed', label: 'ยืนยันแล้ว', color: 'bg-blue-500' },
      { status: 'processing', label: 'กำลังเตรียมสินค้า', color: 'bg-purple-500' },
      { status: 'shipped', label: 'จัดส่งแล้ว', color: 'bg-indigo-500' },
      { status: 'delivered', label: 'จัดส่งสำเร็จ', color: 'bg-green-500' },
      { status: 'cancelled', label: 'ยกเลิก', color: 'bg-red-500' }
    ];

    const totalOrders = orders.length;
    const statusData: OrderStatusData[] = [];

    statusConfig.forEach(config => {
      const count = orders.filter(order =>
        order.status?.toLowerCase() === config.status.toLowerCase()
      ).length;

      if (count > 0 || config.status === 'pending' || config.status === 'confirmed') {
        statusData.push({
          status: config.status,
          label: config.label,
          count: count,
          color: config.color,
          percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
        });
      }
    });

    return statusData;
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
