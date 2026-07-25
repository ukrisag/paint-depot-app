import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Cart, CartItem, AddToCartRequest } from '../models/cart.model';
import { CartService as ApiCartService } from './openapi-client/api/cart.service';
import { AuthService } from './auth.service';
import { CartDto, CartItemDto, AddToCartDto, UpdateCartItemDto } from './openapi-client/model/models';
import { Product, ProductVariant } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = this.initializeCart();
  private cartSubject = new BehaviorSubject<Cart>(this.cart);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private apiCartService: ApiCartService,
    private authService: AuthService
  ) {
    // Subscribe to authentication changes to load cart when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCart();
      } else {
        // Clear cart when user logs out
        this.cart = this.initializeCart();
        this.cartSubject.next(this.cart);
      }
    });

    // Load cart on initialization if user is already logged in
    if (this.authService.currentUserValue) {
      this.loadCart();
    }
  }

  /**
   * Initialize empty cart
   */
  private initializeCart(): Cart {
    return {
      id: 0,
      items: [],
      subtotal: 0,
      totalItems: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Load cart from API
   */
  public loadCart(): void {
    this.apiCartService.apiCartGet().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cart = this.transformCartDto(response.data);
          this.cartSubject.next(this.cart);
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }

  /**
   * Transform API CartDto to local Cart interface
   */
  private transformCartDto(cartDto: CartDto): Cart {
    return {
      id: cartDto.id || 0,
      userId: cartDto.userId || undefined,
      items: (cartDto.items || []).map(item => this.transformCartItemDto(item)),
      subtotal: cartDto.subtotal || 0,
      totalItems: cartDto.itemCount || 0,
      createdAt: cartDto.createdAt ? new Date(cartDto.createdAt) : new Date(),
      updatedAt: cartDto.updatedAt ? new Date(cartDto.updatedAt) : new Date(),
    };
  }

  /**
   * Transform API CartItemDto to local CartItem interface
   */
  private transformCartItemDto(itemDto: CartItemDto): CartItem {
    // Create minimal Product and ProductVariant objects from the flattened CartItemDto
    const product: Product = {
      id: itemDto.productId || 0,
      categoryId: (itemDto as any).categoryId || 0,
      brandId: (itemDto as any).brandId || 0,
      sku: itemDto.sku || '',
      name: itemDto.productName || '',
      slug: (itemDto as any).slug || '',
      shortDescription: '',
      fullDescription: '',
      features: [],
      specifications: {},
      basePrice: itemDto.price || 0,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      isActive: true,
      images: itemDto.imageUrl ? [{ id: 0, productId: itemDto.productId || 0, imageUrl: itemDto.imageUrl, displayOrder: 0, isPrimary: true, createdAt: new Date() }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const variant: ProductVariant = {
      id: itemDto.productVariantId || 0,
      productId: itemDto.productId || 0,
      name: itemDto.variantName || '',
      sku: itemDto.sku || '',
      sizeValue: (itemDto as any).sizeValue || 0,
      sizeUnit: (itemDto as any).sizeUnit || '',
      colorName: (itemDto as any).colorName,
      colorCode: (itemDto as any).colorCode,
      price: itemDto.price || 0,
      compareAtPrice: (itemDto as any).compareAtPrice,
      stockQuantity: itemDto.stockQuantity || 0,
      lowStockThreshold: (itemDto as any).lowStockThreshold || 0,
      weight: (itemDto as any).weight,
      dimensions: (itemDto as any).dimensions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      id: itemDto.id || 0,
      cartId: 0, // Not provided by API
      productVariantId: itemDto.productVariantId || 0,
      quantity: itemDto.quantity || 0,
      priceAtAdd: itemDto.price || 0,
      product: product,
      variant: variant,
      subtotal: itemDto.total || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get current cart
   */
  getCart(): Cart {
    return this.cart;
  }

  /**
   * Add item to cart
   */
  addToCart(request: AddToCartRequest): Observable<Cart> {
    const addToCartDto: AddToCartDto = {
      productVariantId: request.productVariantId,
      quantity: request.quantity
    };

    return this.apiCartService.apiCartItemsPost(addToCartDto).pipe(
      map(response => {
        if (response.success && response.data) {
          this.cart = this.transformCartDto(response.data);
          this.cartSubject.next(this.cart);
          return this.cart;
        }
        throw new Error(response.message || 'Failed to add item to cart');
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return this.removeCartItem(itemId);
    }

    const updateDto: UpdateCartItemDto = {
      quantity: quantity
    };

    return this.apiCartService.apiCartItemsIdPut(itemId, updateDto).pipe(
      map(response => {
        if (response.success && response.data) {
          this.cart = this.transformCartDto(response.data);
          this.cartSubject.next(this.cart);
          return this.cart;
        }
        throw new Error(response.message || 'Failed to update cart item');
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeCartItem(itemId: number): Observable<Cart> {
    return this.apiCartService.apiCartItemsIdDelete(itemId).pipe(
      tap(() => {
        // After deletion, reload the cart to get updated state
        this.loadCart();
      }),
      map(() => this.cart)
    );
  }

  /**
   * Clear cart
   */
  clearCart(): Observable<Cart> {
    return this.apiCartService.apiCartDelete().pipe(
      tap(() => {
        // After clearing, reload the cart to get updated state
        this.loadCart();
      }),
      map(() => this.cart)
    );
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    return this.cart.totalItems;
  }

  /**
   * Get cart subtotal
   */
  getCartSubtotal(): number {
    return this.cart.subtotal;
  }
}
