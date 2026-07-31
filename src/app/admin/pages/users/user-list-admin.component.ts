import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUserService } from '../../services/admin-user.service';
import { NotificationService } from '../../../services/notification.service';
import { ReportService } from '../../../services/report.service';
import { UserDto } from '../../../services/openapi-client/model/userDto';

@Component({
  selector: 'app-user-list-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list-admin.component.html',
  styleUrls: ['./user-list-admin.component.css']
})
export class UserListAdminComponent implements OnInit {
  users = signal<UserDto[]>([]);

  loading = signal(true);
  error = signal('');

  // Filters
  searchQuery = signal('');
  selectedRole = signal<string | undefined>(undefined);
  selectedStatus = signal<string | undefined>(undefined);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Ban/Activate confirmation
  userToToggle = signal<UserDto | undefined>(undefined);
  showToggleConfirm = signal(false);
  toggleAction = signal<'ban' | 'activate'>('ban');

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
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminUserService.getUsers(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery() || undefined
    ).subscribe({
      next: (response) => {
        let users = response.users || [];

        // Apply filters
        users = this.filterUsers(users);

        this.users.set(users);
        this.totalItems.set(users.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load users');
        this.notificationService.error('Unable to load users');
        this.loading.set(false);
        console.error('Error loading users:', err);
      }
    });
  }

  filterUsers(users: UserDto[]): UserDto[] {
    let filtered = [...users];

    // Filter by role
    if (this.selectedRole()) {
      filtered = filtered.filter(u => u.role === this.selectedRole());
    }

    // Filter by status
    if (this.selectedStatus()) {
      filtered = filtered.filter(u => u.status === this.selectedStatus());
    }

    return filtered;
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  onViewDetail(userId: number | undefined): void {
    if (!userId) return;
    this.router.navigate(['/admin/users', userId]);
  }

  onToggleStatusClick(user: UserDto): void {
    this.userToToggle.set(user);
    this.toggleAction.set(user.status === 'Active' ? 'ban' : 'activate');
    this.showToggleConfirm.set(true);
  }

  onConfirmToggleStatus(): void {
    if (!this.userToToggle()?.id) return;

    const newStatus = this.toggleAction() === 'ban' ? 'Banned' : 'Active';

    this.adminUserService.updateUserStatus(this.userToToggle()!.id!, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          // Update user in list
          this.users.update(users => {
            const index = users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              const updated = [...users];
              updated[index] = updatedUser;
              return updated;
            }
            return users;
          });
          this.notificationService.success(
            this.toggleAction() === 'ban' ? 'User banned successfully' : 'User activated successfully'
          );
        }
        this.showToggleConfirm.set(false);
        this.userToToggle.set(undefined);
      },
      error: (err) => {
        this.notificationService.error('Unable to update user status');
        this.showToggleConfirm.set(false);
        this.userToToggle.set(undefined);
        console.error('Error updating user status:', err);
      }
    });
  }

  onCancelToggleStatus(): void {
    this.showToggleConfirm.set(false);
    this.userToToggle.set(undefined);
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
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedRole.set(undefined);
    this.selectedStatus.set(undefined);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Report downloads
  downloadExcel(): void {
    this.reportService.downloadUsersExcel(this.selectedRole());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน Excel...');
  }

  downloadPdf(): void {
    this.reportService.downloadUsersPdf(this.selectedRole());
    this.notificationService.success('กำลังดาวน์โหลดรายงาน PDF...');
  }
}
