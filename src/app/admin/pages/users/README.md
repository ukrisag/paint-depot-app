# Users Management Components

This directory contains the complete user management interface for the admin panel.

## Components

### 1. UserListAdminComponent (`user-list-admin.component.ts`)
The main listing component for managing users.

**Features:**
- Display all users in a responsive table
- Filters:
  - Role dropdown (Customer, Admin, Super_Admin)
  - Status dropdown (Active/Banned)
  - Search by name or email
- Pagination (20 users per page)
- Actions:
  - View user details
  - Ban/Activate user with confirmation modal
- Responsive design with card view for mobile devices
- Uses ChangeDetectorRef for proper change detection

**Service Methods Used:**
- `AdminUserService.getUsers(pageNumber, pageSize, search)`
- `AdminUserService.updateUserStatus(id, statusDto)`

### 2. UserDetailAdminComponent (`user-detail-admin.component.ts`)
Detailed view of a single user with management capabilities.

**Features:**
- Display complete user information:
  - Personal info (name, email, phone)
  - Account details (ID, registration date, last login)
  - Email verification status
- Role management:
  - View current role
  - Edit role dropdown (Note: requires additional API endpoint)
  - Save button with confirmation
- Account actions:
  - Ban/Activate user button with confirmation modal
- Order history:
  - Display recent 10 orders
  - Show order number, date, status, and total
  - Link to order details
- Statistics:
  - Total orders count
  - Total amount spent
- Back button to user list
- Uses ChangeDetectorRef for proper change detection

**Service Methods Used:**
- `AdminUserService.getUserById(id)`
- `AdminUserService.updateUserStatus(id, statusDto)`
- `AdminOrderService.getAllOrders(pageNumber, pageSize)` (filtered by userId)

### 3. UsersAdminComponent (`users-admin.component.ts`)
Router outlet wrapper component for the users module.

## Routes Configuration

Add these routes to `/src/app/admin/admin.routes.ts`:

```typescript
{
  path: 'users',
  loadComponent: () => import('./pages/users/user-list-admin.component').then(m => m.UserListAdminComponent)
},
{
  path: 'users/:id',
  loadComponent: () => import('./pages/users/user-detail-admin.component').then(m => m.UserDetailAdminComponent)
}
```

## API Endpoints

### Available Endpoints:
1. **GET /api/admin/users**
   - Get all users with pagination and search
   - Query params: `pageNumber`, `pageSize`, `search`

2. **GET /api/admin/users/{id}**
   - Get user details by ID

3. **PUT /api/admin/users/{id}/status**
   - Update user status (ban/activate)
   - Body: `{ status: "Active" | "Banned" }`

### Endpoints Needed (Not Yet Implemented):
1. **PUT /api/admin/users/{id}/role**
   - Update user role
   - Body: `{ role: "Customer" | "Admin" | "Super_Admin" }`
   - Note: Currently shows info message when attempted

2. **GET /api/admin/users/{id}/orders**
   - Get orders for a specific user
   - Note: Currently using getAllOrders and filtering client-side

## Data Models

### UserDto
```typescript
{
  id?: number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  emailVerified?: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}
```

### UpdateUserStatusDto
```typescript
{
  status?: string | null;
}
```

## Styling

All components use Tailwind CSS for styling, matching the existing admin panel design:
- Consistent color scheme (blue for primary actions, red for destructive actions)
- Responsive design with mobile-first approach
- Hover effects and transitions
- Loading states with spinners
- Error states with bordered alerts
- Status badges with color coding:
  - Green: Active
  - Red: Banned

## Integration with Navigation

Add to the admin sidebar navigation (`admin-layout.component.ts` or navigation config):

```typescript
{
  icon: 'users',
  label: 'Users',
  route: '/admin/users'
}
```

## Usage

1. Navigate to `/admin/users` to see the user list
2. Use filters to search and filter users by role or status
3. Click "View Detail" to see full user information
4. Click "Ban" or "Activate" to change user status
5. In the detail view, manage user roles and view order history

## Future Enhancements

1. Implement role update API endpoint
2. Implement dedicated user orders API endpoint
3. Add user activity logs
4. Add export functionality (CSV/Excel)
5. Add bulk actions (bulk ban/activate)
6. Add advanced filters (registration date range, last login date)
7. Add user communication features (send email)
8. Add password reset functionality
