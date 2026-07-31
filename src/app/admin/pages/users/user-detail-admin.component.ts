import { Component, OnInit, signal } from '@angular/core';
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
  user = signal<UserDto | undefined>(undefined);
  userId = signal<number | undefined>(undefined);
  userOrders = signal<OrderDto[]>([]);

  loading = signal(true);
  loadingOrders = signal(false);
  updating = signal(false);
  error = signal('');

  // Role update form
  selectedRole = signal('');
  editingRole = signal(false);

  // Ban/Activate confirmation
  showToggleConfirm = signal(false);
  toggleAction = signal<'ban' | 'activate'>('ban');

  // Available roles
  roles = [
    { value: 'Customer', label: 'Customer' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Super_Admin', label: 'Super Admin' }
  ];

  // Stats
  totalOrders = signal(0);
  totalSpent = signal(0);

  constructor(
    private adminUserService: AdminUserService,
    private adminOrderService: AdminOrderService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(parseInt(id, 10));
      this.loadUser(this.userId()!);
      this.loadUserOrders(this.userId()!);
    } else {
      this.error.set('User ID not found');
      this.loading.set(false);
    }
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.adminUserService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.user.set(user);
          this.selectedRole.set(user.role || '');
        } else {
          this.error.set('User not found');
          this.notificationService.error('User not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load user details');
        this.notificationService.error('Unable to load user details');
        this.loading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }

  loadUserOrders(userId: number): void {
    this.loadingOrders.set(true);

    // Load all orders and filter by user ID
    this.adminOrderService.getAllOrders(1, 100).subscribe({
      next: (response) => {
        // Filter orders for this user
        const userOrders = (response.data || []).filter((o: OrderDto) => o.userId === userId);

        // Sort by date (newest first) and take only recent 10
        this.userOrders.set(userOrders
          .sort((a: OrderDto, b: OrderDto) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 10));

        // Calculate stats (exclude cancelled orders)
        const activeOrders = userOrders.filter((o: OrderDto) =>
          o.status?.toLowerCase() !== 'cancelled'
        );
        this.totalOrders.set(activeOrders.length);
        this.totalSpent.set(activeOrders.reduce((sum: number, order: OrderDto) => sum + (order.totalAmount || 0), 0));

        this.loadingOrders.set(false);
      },
      error: (err) => {
        console.error('Error loading user orders:', err);
        this.loadingOrders.set(false);
      }
    });
  }

  onEditRole(): void {
    this.editingRole.set(true);
  }

  onCancelEditRole(): void {
    this.editingRole.set(false);
    this.selectedRole.set(this.user()?.role || '');
  }

  onSaveRole(): void {
    if (!this.userId() || !this.selectedRole()) {
      this.notificationService.error('Please select a role');
      return;
    }

    // Note: This would require an API endpoint to update user role
    // For now, we'll show a message that this feature needs backend support
    this.notificationService.info('Role update feature requires additional API endpoint implementation');
    this.editingRole.set(false);

    // Uncomment this when the API endpoint is available:
    /*
    this.updating.set(true);

    // Call API to update role
    this.adminUserService.updateUserRole(this.userId()!, { role: this.selectedRole() }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.user.set(updatedUser);
          this.notificationService.success('User role updated successfully');
        }
        this.updating.set(false);
        this.editingRole.set(false);
      },
      error: (err) => {
        this.notificationService.error('Unable to update user role');
        this.updating.set(false);
        console.error('Error updating user role:', err);
      }
    });
    */
  }

  onToggleStatusClick(): void {
    this.toggleAction.set(this.user()?.status === 'Active' ? 'ban' : 'activate');
    this.showToggleConfirm.set(true);
  }

  onConfirmToggleStatus(): void {
    if (!this.userId()) return;

    this.updating.set(true);
    const newStatus = this.toggleAction() === 'ban' ? 'Banned' : 'Active';

    this.adminUserService.updateUserStatus(this.userId()!, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.user.set(updatedUser);
          this.notificationService.success(
            this.toggleAction() === 'ban' ? 'User banned successfully' : 'User activated successfully'
          );
        }
        this.showToggleConfirm.set(false);
        this.updating.set(false);
      },
      error: (err) => {
        this.notificationService.error('Unable to update user status');
        this.showToggleConfirm.set(false);
        this.updating.set(false);
        console.error('Error updating user status:', err);
      }
    });
  }

  onCancelToggleStatus(): void {
    this.showToggleConfirm.set(false);
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
