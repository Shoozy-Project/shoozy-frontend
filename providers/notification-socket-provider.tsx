'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { disconnectNotificationSocket, getNotificationSocket } from '@/lib/notifications-socket';
import { localizeNotification } from '@/lib/notifications';
import { notificationKeys } from '@/lib/hooks/use-notifications';
import { useAuthStore } from '@/stores/auth-store';
import { useLocaleStore } from '@/stores/locale-store';
import type { NotificationDto, NotificationList } from '@/types/notifications';

function newerOrEqual(incoming: NotificationDto, current: NotificationDto) {
  return Date.parse(incoming.updatedAt) >= Date.parse(current.updatedAt);
}

export function NotificationSocketProvider() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const locale = useLocaleStore((state) => state.locale);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const toastedIds = useRef(new Set<string>());
  const refreshInFlight = useRef(false);
  const pathnameRef = useRef(pathname);
  const localeRef = useRef(locale);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    toastedIds.current.clear();
  }, [userId]);

  useEffect(() => {
    if (!accessToken || !userId) {
      disconnectNotificationSocket();
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      return;
    }

    const socket = getNotificationSocket();
    socket.auth = { token: accessToken };

    const refreshInbox = () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    const upsert = (raw: NotificationDto, prepend: boolean) => {
      const activeLocale = localeRef.current;
      const incoming = localizeNotification(raw, activeLocale);
      queryClient.setQueriesData<NotificationList>(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return key[0] === 'notifications' && key[1] === userId && key[2] === activeLocale && key[3] === 'list';
          },
        },
        (current) => {
          if (!current) return current;
          const index = current.items.findIndex((item) => item.id === incoming.id);
          if (index < 0 && (!prepend || current.pagination.page !== 1)) return current;
          if (index >= 0 && !newerOrEqual(incoming, current.items[index])) return current;
          const without = current.items.filter((item) => item.id !== incoming.id);
          const items = prepend ? [incoming, ...without] : [...without];
          if (!prepend) items.splice(index, 0, incoming);
          const isNew = index < 0;
          const total = current.pagination.total + (isNew ? 1 : 0);
          return {
            items: items.slice(0, current.pagination.limit),
            pagination: {
              ...current.pagination,
              total,
              totalPages: Math.ceil(total / current.pagination.limit),
            },
          };
        },
      );
    };

    const onNew = (notification: NotificationDto) => {
      upsert(notification, true);
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unread(userId) });
      if (!pathnameRef.current.startsWith('/checkout') && !toastedIds.current.has(notification.id)) {
        toastedIds.current.add(notification.id);
        const localized = localizeNotification(notification, localeRef.current);
        toast(localized.title, { description: localized.message });
      }
    };

    const onUpdated = (notification: NotificationDto) => upsert(notification, false);
    const onDeleted = ({ id }: { id: string }) => {
      queryClient.setQueriesData<NotificationList>(
        {
          predicate: (query) => query.queryKey[0] === 'notifications'
            && query.queryKey[1] === userId
            && query.queryKey[3] === 'list',
        },
        (current) => {
          if (!current || !current.items.some((item) => item.id === id)) return current;
          const total = Math.max(0, current.pagination.total - 1);
          return {
            items: current.items.filter((item) => item.id !== id),
            pagination: {
              ...current.pagination,
              total,
              totalPages: Math.ceil(total / current.pagination.limit),
            },
          };
        },
      );
    };
    const onUnreadCount = ({ count }: { count: number }) => {
      queryClient.setQueryData(notificationKeys.unread(userId), { count });
    };
    const onConnectError = (error: Error & { data?: { code?: string } }) => {
      if (!error.data?.code?.startsWith('AUTH_') || refreshInFlight.current) return;
      refreshInFlight.current = true;
      void authApi.refresh()
        .then((response) => {
          const { accessToken: token, user } = response.data.data;
          useAuthStore.getState().setAuth(token, user);
        })
        .catch(() => useAuthStore.getState().clearAuth())
        .finally(() => {
          refreshInFlight.current = false;
        });
    };

    socket.on('connect', refreshInbox);
    socket.on('connect_error', onConnectError);
    socket.on('notification:new', onNew);
    socket.on('notification:updated', onUpdated);
    socket.on('notification:deleted', onDeleted);
    socket.on('notification:unread-count', onUnreadCount);
    socket.connect();

    return () => {
      socket.off('connect', refreshInbox);
      socket.off('connect_error', onConnectError);
      socket.off('notification:new', onNew);
      socket.off('notification:updated', onUpdated);
      socket.off('notification:deleted', onDeleted);
      socket.off('notification:unread-count', onUnreadCount);
      socket.disconnect();
    };
  }, [accessToken, queryClient, userId]);

  return null;
}
