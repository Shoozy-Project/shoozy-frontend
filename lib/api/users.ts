import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type { CustomerDetailDto, CustomerDto, CustomerListParams, CustomerStatus } from '@/types/user';

export const adminCustomersApi = {
  list: (params: CustomerListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CustomerDto>>>('/admin/customers', { params }),
  getById: (customerId: string) =>
    apiClient.get<ApiSuccess<CustomerDetailDto>>(`/admin/customers/${customerId}`),
  setStatus: (customerId: string, status: CustomerStatus) =>
    apiClient.patch<ApiSuccess<CustomerDto>>(`/admin/customers/${customerId}/status`, { status }),
};
