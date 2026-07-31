export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
  role: 'customer' | 'admin' | 'super_admin';
  emailVerifiedAt?: Date;
  addresses?: UserAddress[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserAddress {
  id: number;
  userId: number;
  addressType: 'shipping' | 'billing';
  isDefault: boolean;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
