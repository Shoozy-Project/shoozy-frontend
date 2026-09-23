'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';
import type { NotificationListParams } from '@/types/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string, locale: string, params: NotificationListParams) =>
    ['notifications', userId, locale, 'list', params] as const,
  unread: (userId: string) => ['notifications', userId, 'unread-count'] as const,
};

export function useNotifications(params: NotificationListParams = {}) {
  const userId = useAuthStore((state) => state.user?.id);
  const initialized = useAuthStore((state) => state.isInitialized);
  const locale = useLocaleStore((state) => state.locale);
  return useQuery({
    queryKey: notificationKeys.list(userId ?? 'anonymous', locale, params),
    queryFn: () => notificationsApi.list(params),
    enabled: initialized && !!userId,
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function useNotificationUnreadCount() {
  const userId = useAuthStore((state) => state.user?.id);
  const initialized = useAuthStore((state) => state.isInitialized);
  return useQuery({
    queryKey: notificationKeys.unread(userId ?? 'anonymous'),
    queryFn: notificationsApi.unreadCount,
    enabled: initialized && !!userId,
    staleTime: 15_000,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: invalidate });
  const markAllRead = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: notificationsApi.delete, onSuccess: invalidate });

  return { markRead, markAllRead, remove };
}

