import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ProductListComponent } from './components/products/product-list/product-list';
import { ProductDetailComponent } from './components/products/product-detail/product-detail';
import { CartComponent } from './components/cart/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout/checkout.component';
import { ProfileComponent } from './components/user/profile/profile';
import { CategoriesComponent } from './components/categories/categories';
import { BrandsComponent } from './components/brands/brands';
import { AboutComponent } from './components/about/about.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { OrderConfirmationComponent } from './components/orders/order-confirmation/order-confirmation.component';
import { OrderListComponent } from './components/orders/order-list/order-list.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { WishlistComponent } from './components/wishlist/wishlist/wishlist.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'brands', component: BrandsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'about', component: AboutComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [authGuard] },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
