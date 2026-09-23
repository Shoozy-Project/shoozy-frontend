import type { PaginatedData } from '@/types/api';

export const NOTIFICATION_TYPES = [
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'RETURN_REQUESTED',
  'RETURN_STATUS_UPDATED',
  'EXCHANGE_REQUESTED',
  'EXCHANGE_STATUS_UPDATED',
  'REVIEW_PENDING',
  'LOW_STOCK',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationDto {
  id: string;
  type: NotificationType;
  entityType: string;
  entityId: string;
  templateKey: string;
  templateParams: Record<string, string>;
  title: string;
  message: string;
  metadata: unknown;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export type NotificationList = PaginatedData<NotificationDto>;

export interface NotificationServerEvents {
  'notification:new': (notification: NotificationDto) => void;
  'notification:updated': (notification: NotificationDto) => void;
  'notification:deleted': (payload: { id: string }) => void;
  'notification:unread-count': (payload: { count: number }) => void;
}

