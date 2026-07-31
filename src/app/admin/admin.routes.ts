import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products-list-admin.component').then(m => m.ProductsListAdminComponent)
      },
      {
        path: 'products/create',
        loadComponent: () => import('./pages/products/product-form-admin.component').then(m => m.ProductFormAdminComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./pages/products/product-form-admin.component').then(m => m.ProductFormAdminComponent)
      },
      {
        path: 'brands',
        loadComponent: () => import('./pages/brands/brand-list-admin.component').then(m => m.BrandListAdminComponent)
      },
      // Gallery
      {
        path: 'gallery',
        loadComponent: () => import('./pages/gallery/gallery-admin.component').then(m => m.GalleryAdminComponent)
      },
      // Orders
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/order-list-admin.component').then(m => m.OrderListAdminComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./pages/orders/order-detail-admin.component').then(m => m.OrderDetailAdminComponent)
      },
      // Users
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list-admin.component').then(m => m.UserListAdminComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/users/user-detail-admin.component').then(m => m.UserDetailAdminComponent)
      },
      // Coupons
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/coupon-list-admin.component').then(m => m.CouponListAdminComponent)
      },
      {
        path: 'coupons/create',
        loadComponent: () => import('./pages/coupons/coupon-form-admin.component').then(m => m.CouponFormAdminComponent)
      },
      {
        path: 'coupons/edit/:id',
        loadComponent: () => import('./pages/coupons/coupon-form-admin.component').then(m => m.CouponFormAdminComponent)
      },
      // Categories
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/category-list-admin.component').then(m => m.CategoryListAdminComponent)
      },
      // Reviews
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/review-list-admin.component').then(m => m.ReviewListAdminComponent)
      }
    ]
  }
];
