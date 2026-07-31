export interface Product {
  id: number;
  categoryId: number;
  brandId: number;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  features?: string[];
  specifications?: Record<string, any>;
  usageInstructions?: string;
  warnings?: string;
  standardCertification?: string;
  coverageAreaPerLiter?: number;
  basePrice: number;
  compareAtPrice?: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  images?: ProductImage[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  sizeValue: number;
  sizeUnit: string;
  colorName?: string;
  colorCode?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Category {
  id: number;
  parentId?: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  orderId?: number;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
