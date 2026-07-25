import { ProductVariant } from './product.model';

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingInfo: ShippingInfo;
  billingInfo?: BillingInfo;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  payment?: Payment;
  customerNotes?: string;
  adminNotes?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  orderedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number;
  productSnapshot: {
    name: string;
    sku: string;
    brand: string;
    size: string;
    color?: string;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: ProductVariant;
  createdAt: Date;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'pickup';
  trackingNumber?: string;
}

export interface BillingInfo {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  notes?: string;
  createdBy?: number;
  createdAt: Date;
}

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  paymentProvider: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentSlipUrl?: string;
  paymentDetails?: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  items: {
    productVariantId: number;
    quantity: number;
  }[];
  shippingInfo: ShippingInfo;
  billingInfo?: BillingInfo;
  paymentMethod: string;
  couponCode?: string;
  customerNotes?: string;
}
