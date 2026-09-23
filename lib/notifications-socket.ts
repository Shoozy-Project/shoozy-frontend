'use client';

import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/constants';
import type { NotificationServerEvents } from '@/types/notifications';

type NotificationSocket = Socket<NotificationServerEvents>;

let socket: NotificationSocket | null = null;

function backendOrigin() {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function getNotificationSocket() {
  if (!socket) {
    socket = io(backendOrigin(), {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectNotificationSocket() {
  if (!socket) return;
  socket.disconnect();
}

