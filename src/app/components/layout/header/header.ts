import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ElementRef, ViewChild, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, debounceTime, Subject } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { UserDto } from '../../../services/openapi-client/model/models';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('headerElement') headerElement?: ElementRef<HTMLElement>;
  @ViewChild('mobileMenuRef') mobileMenuRef?: ElementRef<HTMLElement>;
  @ViewChild('userDropdownRef') userDropdownRef?: ElementRef<HTMLElement>;
  @ViewChild('userMenuRef') userMenuRef?: ElementRef<HTMLElement>;

  cartItemCount = signal(0);
  isMobileMenuOpen = false;
  isSearchOpen = false;
  isUserMenuOpen = false;
  searchQuery = '';
  mobileSearchQuery = '';
  searchResults: Product[] = [];
  currentUser: UserDto | null = null;
  isScrolled = false;
  private subscriptions: Subscription[] = [];
  private searchSubject = new Subject<string>();
  private lastScrollY = 0;

  constructor(
    public cartService: CartService,
    private productService: ProductService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.cartService.cart$.subscribe(cart => {
        this.cartItemCount.set(cart.totalItems);
      }),
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      }),
      this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
        this.performSearch(query);
      }),
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.closeMobileMenu();
          this.isUserMenuOpen = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.searchSubject.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    this.isScrolled = currentScrollY > 10;

    // Add/remove class for header styling
    if (this.headerElement) {
      if (this.isScrolled) {
        this.headerElement.nativeElement.classList.add('scrolled');
      } else {
        this.headerElement.nativeElement.classList.remove('scrolled');
      }
    }

    this.lastScrollY = currentScrollY;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close user menu when clicking outside
    if (this.isUserMenuOpen && this.userMenuRef) {
      const clickedInside = this.userMenuRef.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.closeUserMenu();
      }
    }
  }

  toggleMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  private openMobileMenu() {
    this.isMobileMenuOpen = true;
  }

  private closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 100);
    } else {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  toggleUserMenu() {
    if (this.isUserMenuOpen) {
      this.closeUserMenu();
    } else {
      this.openUserMenu();
    }
  }

  private openUserMenu() {
    this.isUserMenuOpen = true;
    // No animations needed - instant display
  }

  private closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  onMobileSearchInput() {
    this.searchSubject.next(this.mobileSearchQuery);
  }

  private performSearch(query: string) {
    if (query.trim().length > 0) {
      this.productService.searchProducts(query).subscribe(results => {
        this.searchResults = results.slice(0, 5);
      });
    } else {
      this.searchResults = [];
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery }
      });
      this.toggleSearch();
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  onMobileSearchSubmit() {
    if (this.mobileSearchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.mobileSearchQuery }
      });
      this.closeMobileMenu();
      this.mobileSearchQuery = '';
    }
  }

  goToProduct(slug: string) {
    this.router.navigate(['/products', slug]);
    this.toggleSearch();
    this.searchQuery = '';
    this.searchResults = [];
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }
}
