import apiClient from './client';
import type { ApiSuccess } from '@/types/api';

export interface StoreSettingsDto {
  id: number;
  storeName: string;
  countryCode: string;
  currency: string;
  currencyMinorUnit: number;
  whatsappNumber: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  shippingPolicy: string | null;
  returnWindowDays: number;
  exchangeWindowDays: number;
  whatsappConfirmationEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateStoreSettingsPayload = Pick<StoreSettingsDto,
  'storeName' | 'whatsappNumber' | 'supportPhone' | 'supportEmail' | 'shippingPolicy' |
  'returnWindowDays' | 'exchangeWindowDays' | 'whatsappConfirmationEnabled'>;

export const storeSettingsApi = {
  get: () => apiClient.get<ApiSuccess<StoreSettingsDto>>('/admin/store-settings'),
  update: (payload: UpdateStoreSettingsPayload) => apiClient.patch<ApiSuccess<StoreSettingsDto>>('/admin/store-settings', payload),
};
