import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminUserService } from '../../services/admin-user.service';
import { AdminOrderService } from '../../services/admin-order.service';
import { NotificationService } from '../../../services/notification.service';
import { UserDto } from '../../../services/openapi-client/model/userDto';
import { OrderDto } from '../../../services/openapi-client/model/orderDto';

@Component({
  selector: 'app-user-detail-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail-admin.component.html',
  styleUrls: ['./user-detail-admin.component.css']
})
export class UserDetailAdminComponent implements OnInit {
  user?: UserDto;
  userId?: number;
  userOrders: OrderDto[] = [];

  loading = true;
  loadingOrders = false;
  updating = false;
  error = '';

  // Role update form
  selectedRole = '';
  editingRole = false;

  // Ban/Activate confirmation
  showToggleConfirm = false;
  toggleAction: 'ban' | 'activate' = 'ban';

  // Available roles
  roles = [
    { value: 'Customer', label: 'Customer' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Super_Admin', label: 'Super Admin' }
  ];

  // Stats
  totalOrders = 0;
  totalSpent = 0;

  constructor(
    private adminUserService: AdminUserService,
    private adminOrderService: AdminOrderService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = parseInt(id, 10);
      this.loadUser(this.userId);
      this.loadUserOrders(this.userId);
    } else {
      this.error = 'User ID not found';
      this.loading = false;
    }
  }

  loadUser(id: number): void {
    this.loading = true;
    this.error = '';

    this.adminUserService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.selectedRole = user.role || '';
        } else {
          this.error = 'User not found';
          this.notificationService.error('User not found');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Unable to load user details';
        this.notificationService.error('Unable to load user details');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading user:', err);
      }
    });
  }

  loadUserOrders(userId: number): void {
    this.loadingOrders = true;

    // Load all orders and filter by user ID
    this.adminOrderService.getAllOrders(1, 100).subscribe({
      next: (response) => {
        // Filter orders for this user
        const userOrders = (response.data || []).filter((o: OrderDto) => o.userId === userId);

        // Sort by date (newest first) and take only recent 10
        this.userOrders = userOrders
          .sort((a: OrderDto, b: OrderDto) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 10);

        // Calculate stats (exclude cancelled orders)
        const activeOrders = userOrders.filter((o: OrderDto) =>
          o.status?.toLowerCase() !== 'cancelled'
        );
        this.totalOrders = activeOrders.length;
        this.totalSpent = activeOrders.reduce((sum: number, order: OrderDto) => sum + (order.totalAmount || 0), 0);

        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user orders:', err);
        this.loadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEditRole(): void {
    this.editingRole = true;
  }

  onCancelEditRole(): void {
    this.editingRole = false;
    this.selectedRole = this.user?.role || '';
  }

  onSaveRole(): void {
    if (!this.userId || !this.selectedRole) {
      this.notificationService.error('Please select a role');
      return;
    }

    // Note: This would require an API endpoint to update user role
    // For now, we'll show a message that this feature needs backend support
    this.notificationService.info('Role update feature requires additional API endpoint implementation');
    this.editingRole = false;

    // Uncomment this when the API endpoint is available:
    /*
    this.updating = true;

    // Call API to update role
    this.adminUserService.updateUserRole(this.userId, { role: this.selectedRole }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.user = updatedUser;
          this.notificationService.success('User role updated successfully');
        }
        this.updating = false;
        this.editingRole = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to update user role');
        this.updating = false;
        this.cdr.detectChanges();
        console.error('Error updating user role:', err);
      }
    });
    */
  }

  onToggleStatusClick(): void {
    this.toggleAction = this.user?.status === 'Active' ? 'ban' : 'activate';
    this.showToggleConfirm = true;
  }

  onConfirmToggleStatus(): void {
    if (!this.userId) return;

    this.updating = true;
    const newStatus = this.toggleAction === 'ban' ? 'Banned' : 'Active';

    this.adminUserService.updateUserStatus(this.userId, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.user = updatedUser;
          this.notificationService.success(
            this.toggleAction === 'ban' ? 'User banned successfully' : 'User activated successfully'
          );
        }
        this.showToggleConfirm = false;
        this.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to update user status');
        this.showToggleConfirm = false;
        this.updating = false;
        this.cdr.detectChanges();
        console.error('Error updating user status:', err);
      }
    });
  }

  onCancelToggleStatus(): void {
    this.showToggleConfirm = false;
  }

  onBack(): void {
    this.router.navigate(['/admin/users']);
  }

  onViewOrder(orderId: number | undefined): void {
    if (!orderId) return;
    this.router.navigate(['/admin/orders', orderId]);
  }

  getRoleLabel(role: string | null | undefined): string {
    if (!role) return '-';
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj?.label || role;
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Active':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800';
      case 'Banned':
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  getOrderStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
      case 'Processing':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800';
      case 'Shipped':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800';
      case 'Delivered':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'Cancelled':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  formatPrice(price: number | undefined): string {
    if (!price && price !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatShortDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}
