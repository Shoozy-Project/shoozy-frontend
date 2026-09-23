import apiClient from '@/lib/api/client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  AddressDto,
  AddressInput,
  ExchangeDto,
  OrderDetailDto,
  OrderListDto,
  ProfileDto,
  PublicStoreSettingsDto,
  ReturnDto,
} from '@/types/commerce';

export const accountApi = {
  profile: async () => (await apiClient.get<ApiSuccess<ProfileDto>>('/users/me')).data.data,
  updateProfile: async (input: { firstName?: string; lastName?: string; phone?: string | null }) =>
    (await apiClient.patch<ApiSuccess<ProfileDto>>('/users/me', input)).data.data,
  addresses: async () => (await apiClient.get<ApiSuccess<AddressDto[]>>('/addresses')).data.data,
  createAddress: async (input: AddressInput) => (await apiClient.post<ApiSuccess<AddressDto>>('/addresses', input)).data.data,
  updateAddress: async (id: string, input: Partial<AddressInput>) => (await apiClient.patch<ApiSuccess<AddressDto>>(`/addresses/${id}`, input)).data.data,
  deleteAddress: (id: string) => apiClient.delete(`/addresses/${id}`),
  setDefaultAddress: async (id: string) => (await apiClient.post<ApiSuccess<AddressDto>>(`/addresses/${id}/default`)).data.data,
  orders: async (page = 1, limit = 20) => (await apiClient.get<ApiSuccess<PaginatedData<OrderListDto>>>('/orders', { params: { page, limit } })).data.data,
  order: async (id: string) => (await apiClient.get<ApiSuccess<OrderDetailDto>>(`/orders/${id}`)).data.data,
  cancelOrder: async (id: string, reason?: string) => (await apiClient.post<ApiSuccess<{ order: OrderDetailDto; idempotentReplay: boolean }>>(`/orders/${id}/cancel`, reason ? { reason } : {})).data.data,
  createReturn: async (orderId: string, input: { reasonCode: string; reasonDetails?: string | null; items: Array<{ orderItemId: string; quantity: number; reasonCode?: string }> }) =>
    (await apiClient.post<ApiSuccess<ReturnDto>>(`/orders/${orderId}/returns`, input)).data.data,
  returns: async (page = 1, limit = 20) => (await apiClient.get<ApiSuccess<PaginatedData<ReturnDto>>>('/returns', { params: { page, limit } })).data.data,
  returnDetail: async (id: string) => (await apiClient.get<ApiSuccess<ReturnDto>>(`/returns/${id}`)).data.data,
  exchanges: async (page = 1, limit = 20) => (await apiClient.get<ApiSuccess<PaginatedData<ExchangeDto>>>('/exchanges', { params: { page, limit } })).data.data,
  exchangeDetail: async (id: string) => (await apiClient.get<ApiSuccess<ExchangeDto>>(`/exchanges/${id}`)).data.data,
  createExchange: async (orderId: string, input: { orderItemId: string; replacementVariantId: string; quantity: number; reason?: string }) =>
    (await apiClient.post<ApiSuccess<ExchangeDto>>(`/orders/${orderId}/exchanges`, input)).data.data,
  storeSettings: async () => (await apiClient.get<ApiSuccess<PublicStoreSettingsDto>>('/store-settings')).data.data,
};
