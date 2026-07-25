import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { UserDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  cartItemCount = 0;
  isMobileMenuOpen = false;
  isSearchOpen = false;
  isUserMenuOpen = false;
  searchQuery = '';
  searchResults: Product[] = [];
  currentUser: UserDto | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public cartService: CartService,
    private productService: ProductService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.cartService.cart$.subscribe(cart => {
        this.cartItemCount = cart.totalItems;
        this.cdr.detectChanges();
      }),
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      // Focus input after modal opens
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 100);
    } else {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  onSearchInput() {
    if (this.searchQuery.trim().length > 0) {
      this.productService.searchProducts(this.searchQuery).subscribe(results => {
        this.searchResults = results.slice(0, 5);
        this.cdr.detectChanges();
      });
    } else {
      this.searchResults = [];
    }
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery }
      });
      this.toggleSearch();
    }
  }

  goToProduct(slug: string) {
    this.router.navigate(['/products', slug]);
    this.toggleSearch();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }
}
