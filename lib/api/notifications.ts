import apiClient from './client';
import type { ApiSuccess } from '@/types/api';
import type {
  NotificationDto,
  NotificationList,
  NotificationListParams,
} from '@/types/notifications';

export const notificationsApi = {
  list: (params: NotificationListParams = {}) =>
    apiClient
      .get<ApiSuccess<NotificationList>>('/notifications', { params })
      .then((response) => response.data.data),

  unreadCount: () =>
    apiClient
      .get<ApiSuccess<{ count: number }>>('/notifications/unread-count')
      .then((response) => response.data.data),

  markRead: (notificationId: string) =>
    apiClient
      .patch<ApiSuccess<NotificationDto>>(`/notifications/${notificationId}/read`)
      .then((response) => response.data.data),

  markAllRead: () =>
    apiClient
      .patch<ApiSuccess<{ updatedCount: number }>>('/notifications/read-all')
      .then((response) => response.data.data),

  delete: (notificationId: string) =>
    apiClient.delete<void>(`/notifications/${notificationId}`),
};

