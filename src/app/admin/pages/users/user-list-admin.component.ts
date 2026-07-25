import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUserService } from '../../services/admin-user.service';
import { NotificationService } from '../../../services/notification.service';
import { UserDto } from '../../../services/openapi-client/model/userDto';

@Component({
  selector: 'app-user-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list-admin.component.html',
  styleUrls: ['./user-list-admin.component.css']
})
export class UserListAdminComponent implements OnInit {
  users: UserDto[] = [];

  loading = true;
  error = '';

  // Filters
  searchQuery = '';
  selectedRole?: string;
  selectedStatus?: string;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 1;

  // Ban/Activate confirmation
  userToToggle?: UserDto;
  showToggleConfirm = false;
  toggleAction: 'ban' | 'activate' = 'ban';

  // Available roles
  roles = [
    { value: 'Customer', label: 'Customer' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Super_Admin', label: 'Super Admin' }
  ];

  // Available statuses
  statuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Banned', label: 'Banned' }
  ];

  constructor(
    private adminUserService: AdminUserService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.adminUserService.getUsers(
      this.currentPage,
      this.pageSize,
      this.searchQuery || undefined
    ).subscribe({
      next: (response) => {
        let users = response.users || [];

        // Apply filters
        users = this.filterUsers(users);

        this.users = users;
        this.totalItems = users.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Unable to load users';
        this.notificationService.error('Unable to load users');
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading users:', err);
      }
    });
  }

  filterUsers(users: UserDto[]): UserDto[] {
    let filtered = [...users];

    // Filter by role
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(u => u.status === this.selectedStatus);
    }

    return filtered;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  onViewDetail(userId: number | undefined): void {
    if (!userId) return;
    this.router.navigate(['/admin/users', userId]);
  }

  onToggleStatusClick(user: UserDto): void {
    this.userToToggle = user;
    this.toggleAction = user.status === 'Active' ? 'ban' : 'activate';
    this.showToggleConfirm = true;
  }

  onConfirmToggleStatus(): void {
    if (!this.userToToggle?.id) return;

    const newStatus = this.toggleAction === 'ban' ? 'Banned' : 'Active';

    this.adminUserService.updateUserStatus(this.userToToggle.id, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          // Update user in list
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.notificationService.success(
            this.toggleAction === 'ban' ? 'User banned successfully' : 'User activated successfully'
          );
        }
        this.showToggleConfirm = false;
        this.userToToggle = undefined;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Unable to update user status');
        this.showToggleConfirm = false;
        this.userToToggle = undefined;
        this.cdr.detectChanges();
        console.error('Error updating user status:', err);
      }
    });
  }

  onCancelToggleStatus(): void {
    this.showToggleConfirm = false;
    this.userToToggle = undefined;
  }

  getRoleLabel(role: string | null | undefined): string {
    if (!role) return '-';
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj?.label || role;
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Active':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'Banned':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedRole = undefined;
    this.selectedStatus = undefined;
    this.currentPage = 1;
    this.loadUsers();
  }
}
