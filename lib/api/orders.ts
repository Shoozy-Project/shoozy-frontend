import { apiClient } from './client';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'CANCELLED';

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantInfo: string; // e.g., "Size: 42 | Color: Black"
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderStatusHistoryDto {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  createdBy: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string; // e.g. "#SHZ-1042"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryNotes?: string;
  paymentMethod: 'COD';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItemDto[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  internalNotes?: string;
  statusHistory: OrderStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | 'ALL';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrdersResponse {
  items: OrderDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    returned: number;
    cancelled: number;
  };
}

// ── In-Memory Mock Store for Offline/Demo Resilience ─────────────────────────
const initialMockOrders: OrderDto[] = [
  {
    id: 'ord-1042',
    orderNumber: '#SHZ-1042',
    customerName: 'Amira Ben Ali',
    customerPhone: '+216 98 123 456',
    customerEmail: 'amira.benali@gmail.com',
    shippingAddress: {
      street: '15 Avenue Habib Bourguiba, Apt 4B',
      city: 'Tunis',
      postalCode: '1001',
      country: 'Tunisia',
    },
    deliveryNotes: 'Please call 10 minutes before arrival.',
    paymentMethod: 'COD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Nike Air Monarch IV',
        productImage: '/images/products/air-monarch.jpg',
        variantInfo: 'Size: 42 | Color: White/Navy',
        unitPrice: 189,
        quantity: 1,
        totalPrice: 189,
      },
    ],
    subtotal: 189,
    shippingFee: 7,
    totalAmount: 196,
    currency: 'TND',
    internalNotes: 'Customer verified by phone on Friday morning.',
    statusHistory: [
      { id: 'h-1', status: 'PENDING', createdAt: '2026-08-28T09:00:00Z', createdBy: 'System' },
      { id: 'h-2', status: 'CONFIRMED', note: 'Phone confirmed', createdAt: '2026-08-28T10:30:00Z', createdBy: 'Admin (Staff)' },
      { id: 'h-3', status: 'SHIPPED', note: 'Carrier Aramex #AX9823', createdAt: '2026-08-28T14:00:00Z', createdBy: 'Admin (Staff)' },
      { id: 'h-4', status: 'DELIVERED', note: 'Payment collected by driver', createdAt: '2026-08-28T18:15:00Z', createdBy: 'Admin (Staff)' },
    ],
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T18:15:00Z',
  },
  {
    id: 'ord-1041',
    orderNumber: '#SHZ-1041',
    customerName: 'Yassine Mrad',
    customerPhone: '+216 22 555 789',
    customerEmail: 'yassine.mrad@yahoo.com',
    shippingAddress: {
      street: '42 Rue Les Berges du Lac',
      city: 'Tunis',
      postalCode: '1053',
      country: 'Tunisia',
    },
    deliveryNotes: 'Leave with building security if not answering.',
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'CONFIRMED',
    items: [
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Urban Leather Premium Boot',
        productImage: '/images/products/leather-boot.jpg',
        variantInfo: 'Size: 44 | Color: Dark Brown',
        unitPrice: 245,
        quantity: 1,
        totalPrice: 245,
      },
    ],
    subtotal: 245,
    shippingFee: 7,
    totalAmount: 252,
    currency: 'TND',
    internalNotes: 'Confirmed over phone. Package prepared in warehouse.',
    statusHistory: [
      { id: 'h-5', status: 'PENDING', createdAt: '2026-08-28T21:00:00Z', createdBy: 'System' },
      { id: 'h-6', status: 'CONFIRMED', note: 'Customer confirmed order items', createdAt: '2026-08-28T22:15:00Z', createdBy: 'Admin (Staff)' },
    ],
    createdAt: '2026-08-28T21:00:00Z',
    updatedAt: '2026-08-28T22:15:00Z',
  },
  {
    id: 'ord-1040',
    orderNumber: '#SHZ-1040',
    customerName: 'Sana Karoui',
    customerPhone: '+216 50 998 112',
    customerEmail: 'sana.k@outlook.com',
    shippingAddress: {
      street: '88 Route de La Soukra',
      city: 'Ariana',
      postalCode: '2036',
      country: 'Tunisia',
    },
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'SHIPPED',
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        productName: 'Slim Runner Pro Ultra',
        productImage: '/images/products/runner-pro.jpg',
        variantInfo: 'Size: 38 | Color: Pink/White',
        unitPrice: 129,
        quantity: 1,
        totalPrice: 129,
      },
    ],
    subtotal: 129,
    shippingFee: 7,
    totalAmount: 136,
    currency: 'TND',
    statusHistory: [
      { id: 'h-7', status: 'PENDING', createdAt: '2026-08-28T15:00:00Z', createdBy: 'System' },
      { id: 'h-8', status: 'CONFIRMED', createdAt: '2026-08-28T16:00:00Z', createdBy: 'Admin (Staff)' },
      { id: 'h-9', status: 'SHIPPED', note: 'Tracking #TN-40912', createdAt: '2026-08-28T18:00:00Z', createdBy: 'Admin (Staff)' },
    ],
    createdAt: '2026-08-28T15:00:00Z',
    updatedAt: '2026-08-28T18:00:00Z',
  },
  {
    id: 'ord-1039',
    orderNumber: '#SHZ-1039',
    customerName: 'Mohamed Khalil',
    customerPhone: '+216 97 443 210',
    customerEmail: 'm.khalil@gmail.com',
    shippingAddress: {
      street: '12 Avenue Hedi Chaker',
      city: 'Sfax',
      postalCode: '3000',
      country: 'Tunisia',
    },
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'PENDING',
    items: [
      {
        id: 'item-4',
        productId: 'prod-4',
        productName: 'Classic Leather Oxford',
        productImage: '/images/products/oxford.jpg',
        variantInfo: 'Size: 43 | Color: Onyx Black',
        unitPrice: 310,
        quantity: 1,
        totalPrice: 310,
      },
    ],
    subtotal: 310,
    shippingFee: 7,
    totalAmount: 317,
    currency: 'TND',
    statusHistory: [
      { id: 'h-10', status: 'PENDING', createdAt: '2026-08-29T01:30:00Z', createdBy: 'System' },
    ],
    createdAt: '2026-08-29T01:30:00Z',
    updatedAt: '2026-08-29T01:30:00Z',
  },
  {
    id: 'ord-1038',
    orderNumber: '#SHZ-1038',
    customerName: 'Ines Trabelsi',
    customerPhone: '+216 26 881 334',
    customerEmail: 'ines.t@gmail.com',
    shippingAddress: {
      street: '5 Rue Tarak Ibn Ziad',
      city: 'Sousse',
      postalCode: '4000',
      country: 'Tunisia',
    },
    paymentMethod: 'COD',
    paymentStatus: 'CANCELLED',
    status: 'CANCELLED',
    items: [
      {
        id: 'item-5',
        productId: 'prod-5',
        productName: 'Street Flex Casual Sneaker',
        productImage: '/images/products/street-flex.jpg',
        variantInfo: 'Size: 39 | Color: White',
        unitPrice: 98,
        quantity: 1,
        totalPrice: 98,
      },
    ],
    subtotal: 98,
    shippingFee: 7,
    totalAmount: 105,
    currency: 'TND',
    internalNotes: 'Customer cancelled during verification call.',
    statusHistory: [
      { id: 'h-11', status: 'PENDING', createdAt: '2026-08-27T10:00:00Z', createdBy: 'System' },
      { id: 'h-12', status: 'CANCELLED', note: 'Customer requested cancellation over phone', createdAt: '2026-08-27T11:00:00Z', createdBy: 'Admin (Staff)' },
    ],
    createdAt: '2026-08-27T10:00:00Z',
    updatedAt: '2026-08-27T11:00:00Z',
  },
];

let mockOrdersStore: OrderDto[] = [...initialMockOrders];

export const ordersApi = {
  // List orders with search, filtering, and pagination
  list: async (filters: OrderFilters = {}): Promise<PaginatedOrdersResponse> => {
    try {
      const response = await apiClient.get<{ data: PaginatedOrdersResponse }>('/admin/orders', {
        params: filters,
      });
      return response.data.data;
    } catch {
      // Offline / fallback to in-memory store
      let filtered = [...mockOrdersStore];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            o.customerPhone.includes(query)
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((o) => o.status === filters.status);
      }

      const page = filters.page ?? 1;
      const limit = filters.limit ?? 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginatedItems = filtered.slice(start, start + limit);

      const stats = {
        total: mockOrdersStore.length,
        pending: mockOrdersStore.filter((o) => o.status === 'PENDING').length,
        confirmed: mockOrdersStore.filter((o) => o.status === 'CONFIRMED').length,
        shipped: mockOrdersStore.filter((o) => o.status === 'SHIPPED').length,
        delivered: mockOrdersStore.filter((o) => o.status === 'DELIVERED').length,
        returned: mockOrdersStore.filter((o) => o.status === 'RETURNED').length,
        cancelled: mockOrdersStore.filter((o) => o.status === 'CANCELLED').length,
      };

      return {
        items: paginatedItems,
        pagination: { page, limit, total, totalPages },
        stats,
      };
    }
  },

  // Get single order by ID
  getById: async (id: string): Promise<OrderDto> => {
    try {
      const response = await apiClient.get<{ data: OrderDto }>(`/admin/orders/${id}`);
      return response.data.data;
    } catch {
      const found = mockOrdersStore.find((o) => o.id === id || o.orderNumber === id);
      if (!found) throw new Error('Order not found');
      return found;
    }
  },

  // Update order status (with auto payment status update rule for DELIVERED)
  updateStatus: async (
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<OrderDto> => {
    try {
      const response = await apiClient.patch<{ data: OrderDto }>(`/admin/orders/${id}/status`, {
        status,
        note,
      });
      return response.data.data;
    } catch {
      const index = mockOrdersStore.findIndex((o) => o.id === id || o.orderNumber === id);
      if (index === -1) throw new Error('Order not found');

      const existing = mockOrdersStore[index];
      const now = new Date().toISOString();

      // Business Rule: DELIVERED automatically sets payment status to PAID
      let nextPaymentStatus: PaymentStatus = existing.paymentStatus;
      if (status === 'DELIVERED') {
        nextPaymentStatus = 'PAID';
      } else if (status === 'CANCELLED' || status === 'RETURNED') {
        nextPaymentStatus = 'CANCELLED';
      }

      const updatedHistory: OrderStatusHistoryDto[] = [
        ...existing.statusHistory,
        {
          id: `h-${Date.now()}`,
          status,
          note: note || `Status updated to ${status}`,
          createdAt: now,
          createdBy: 'Admin (Staff)',
        },
      ];

      const updatedOrder: OrderDto = {
        ...existing,
        status,
        paymentStatus: nextPaymentStatus,
        statusHistory: updatedHistory,
        updatedAt: now,
      };

      mockOrdersStore[index] = updatedOrder;
      return updatedOrder;
    }
  },

  // Add internal admin notes
  saveInternalNotes: async (id: string, internalNotes: string): Promise<OrderDto> => {
    try {
      const response = await apiClient.patch<{ data: OrderDto }>(`/admin/orders/${id}/notes`, {
        internalNotes,
      });
      return response.data.data;
    } catch {
      const index = mockOrdersStore.findIndex((o) => o.id === id || o.orderNumber === id);
      if (index === -1) throw new Error('Order not found');

      mockOrdersStore[index] = {
        ...mockOrdersStore[index],
        internalNotes,
        updatedAt: new Date().toISOString(),
      };
      return mockOrdersStore[index];
    }
  },
};
