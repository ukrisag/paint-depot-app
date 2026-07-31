import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { WishlistService as ApiWishlistService } from './openapi-client/api/wishlist.service';
import { WishlistDto } from './openapi-client/model/models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItemsSubject = new BehaviorSubject<WishlistDto[]>([]);
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();

  constructor(private apiWishlistService: ApiWishlistService) {}

  loadWishlist(): void {
    this.apiWishlistService.apiWishlistGet().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wishlistItemsSubject.next(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load wishlist', error);
      }
    });
  }

  getWishlist(): Observable<WishlistDto[]> {
    return this.apiWishlistService.apiWishlistGet().pipe(
      map(response => {
        if (response.success && response.data) {
          this.wishlistItemsSubject.next(response.data);
          return response.data;
        }
        throw new Error(response.message || 'Failed to get wishlist');
      })
    );
  }

  addToWishlist(productId: number): Observable<void> {
    // Check if already in wishlist
    if (this.isInWishlist(productId)) {
      // Already in wishlist, just return success
      return of(void 0);
    }

    // Optimistic update - add to local state immediately
    const currentItems = this.wishlistItemsSubject.value;
    const tempItem: WishlistDto = {
      id: Date.now(), // temporary ID
      productId: productId,
      userId: 0,
      createdAt: new Date().toISOString()
    };
    this.wishlistItemsSubject.next([...currentItems, tempItem]);

    return this.apiWishlistService.apiWishlistItemsPost({ productId }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          // Update with real data from server
          const items = this.wishlistItemsSubject.value.filter(item => item.id !== tempItem.id);
          this.wishlistItemsSubject.next([...items, response.data]);
        }
      }),
      map((response: any) => {
        if (!response.success) {
          // Revert optimistic update on error
          this.wishlistItemsSubject.next(currentItems);
          throw new Error(response.message || 'Failed to add to wishlist');
        }
        return void 0;
      }),
      catchError((error) => {
        // Revert optimistic update on error
        this.wishlistItemsSubject.next(currentItems);
        throw error;
      })
    );
  }

  removeFromWishlist(productId: number): Observable<void> {
    // Check if not in wishlist
    if (!this.isInWishlist(productId)) {
      // Not in wishlist, just return success
      return of(void 0);
    }

    // Optimistic update - remove from local state immediately
    const currentItems = this.wishlistItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.productId !== productId);
    this.wishlistItemsSubject.next(updatedItems);

    return this.apiWishlistService.apiWishlistItemsProductIdDelete(productId).pipe(
      map((response: any) => {
        if (!response.success) {
          // Revert optimistic update on error
          this.wishlistItemsSubject.next(currentItems);
          throw new Error(response.message || 'Failed to remove from wishlist');
        }
        return void 0;
      }),
      catchError((error) => {
        // Revert optimistic update on error
        this.wishlistItemsSubject.next(currentItems);
        throw error;
      })
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItemsSubject.value.some(item => item.productId === productId);
  }

  get wishlistCount(): number {
    return this.wishlistItemsSubject.value.length;
  }
}
