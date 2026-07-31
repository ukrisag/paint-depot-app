import { ProductVariant, Product } from './product.model';

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CartItem {
  id: number;
  cartId: number;
  productVariantId: number;
  quantity: number;
  priceAtAdd: number;
  product?: Product;
  variant?: ProductVariant;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productVariantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
