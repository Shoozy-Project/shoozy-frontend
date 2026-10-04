import apiClient from './client';
import type { ApiSuccess } from '@/types/api';
import type {
  AdminSupportConversationDto,
  AdminSupportPage,
  CreatedSupportConversation,
  CreateSupportInput,
  CustomerSupportConversationDto,
  CustomerSupportPage,
  SupportMessagesPage,
  SupportStatus,
} from '@/types/support';

const guestHeaders = (supportToken?: string | null) => supportToken
  ? { headers: { 'X-Support-Token': supportToken } }
  : undefined;

export const supportApi = {
  create: (input: CreateSupportInput) =>
    apiClient.post<ApiSuccess<CreatedSupportConversation>>('/support/conversations', input).then((response) => response.data.data),
  listOwn: (page = 1, limit = 20) =>
    apiClient.get<ApiSuccess<CustomerSupportPage>>('/support/conversations', { params: { page, limit } }).then((response) => response.data.data),
  get: (conversationId: string, supportToken?: string | null) =>
    apiClient.get<ApiSuccess<CustomerSupportConversationDto>>(`/support/conversations/${conversationId}`, guestHeaders(supportToken)).then((response) => response.data.data),
  messages: (conversationId: string, supportToken?: string | null, page = 1, limit = 100) =>
    apiClient.get<ApiSuccess<SupportMessagesPage>>(`/support/conversations/${conversationId}/messages`, { ...guestHeaders(supportToken), params: { page, limit } }).then((response) => response.data.data),
  send: (conversationId: string, message: string, supportToken?: string | null) =>
    apiClient.post(`/support/conversations/${conversationId}/messages`, { message }, guestHeaders(supportToken)),
  read: (conversationId: string, supportToken?: string | null) =>
    apiClient.post(`/support/conversations/${conversationId}/read`, {}, guestHeaders(supportToken)),
};

export const adminSupportApi = {
  list: (params: { page?: number; limit?: number; status?: SupportStatus; unreadOnly?: boolean; search?: string }) =>
    apiClient.get<ApiSuccess<AdminSupportPage>>('/admin/support/conversations', { params }).then((response) => response.data.data),
  get: (conversationId: string) =>
    apiClient.get<ApiSuccess<AdminSupportConversationDto>>(`/admin/support/conversations/${conversationId}`).then((response) => response.data.data),
  messages: (conversationId: string, page = 1, limit = 100) =>
    apiClient.get<ApiSuccess<SupportMessagesPage>>(`/admin/support/conversations/${conversationId}/messages`, { params: { page, limit } }).then((response) => response.data.data),
  send: (conversationId: string, message: string) => apiClient.post(`/admin/support/conversations/${conversationId}/messages`, { message }),
  read: (conversationId: string) => apiClient.post(`/admin/support/conversations/${conversationId}/read`, {}),
  status: (conversationId: string, status: SupportStatus) => apiClient.patch(`/admin/support/conversations/${conversationId}/status`, { status }),
};
