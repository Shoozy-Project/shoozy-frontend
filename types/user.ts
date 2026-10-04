export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface CustomerDto {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  status: CustomerStatus;
  provider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetailDto extends CustomerDto {
  addresses: Array<{
    id: string;
    label: string | null;
    recipientName: string;
    phone: string;
    countryCode: string;
    state: string;
    city: string;
    area: string | null;
    postalCode: string | null;
    line1: string;
    line2: string | null;
    isDefault: boolean;
  }>;
  summary: {
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    netPaidMinor: string;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalMinor: string;
    paidMinor: string;
    refundedMinor: string;
    currency: string;
    createdAt: string;
  }>;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  sortBy?: 'createdAt' | 'firstName' | 'email';
  sortOrder?: 'asc' | 'desc';
}
