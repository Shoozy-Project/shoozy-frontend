import type { PaginatedData } from '@/types/api';

export type SupportStatus = 'OPEN' | 'PENDING' | 'CLOSED';
export type SupportSender = 'CUSTOMER' | 'ADMIN';

export interface SupportMessageDto {
  id: string;
  conversationId: string;
  senderType: SupportSender;
  senderDisplayName: string;
  body: string;
  createdAt: string;
}

export interface CustomerSupportConversationDto {
  id: string;
  reference: string;
  status: SupportStatus;
  order: { orderNumber: string } | null;
  customerUnreadCount: number;
  lastMessageAt: string;
  createdAt: string;
  closedAt: string | null;
}

export interface AdminSupportConversationDto extends Omit<CustomerSupportConversationDto, 'order'> {
  customer: { name: string; phone: string; email: string | null; isGuest: boolean };
  order: { id: string; orderNumber: string } | null;
  adminUnreadCount: number;
  updatedAt: string;
  lastMessagePreview?: string | null;
}

export interface CreateSupportInput {
  name?: string;
  phone?: string;
  email?: string;
  orderNumber?: string;
  message: string;
}

export type SupportMessagesPage = PaginatedData<SupportMessageDto>;
export type CustomerSupportPage = PaginatedData<CustomerSupportConversationDto>;
export type AdminSupportPage = PaginatedData<AdminSupportConversationDto>;

export interface CreatedSupportConversation extends CustomerSupportConversationDto {
  initialMessage: SupportMessageDto;
  supportAccessToken?: string;
}

export interface SupportServerEvents {
  'support:conversation:new': (conversation: AdminSupportConversationDto) => void;
  'support:message:new': (message: SupportMessageDto) => void;
  'support:conversation:updated': (conversation: AdminSupportConversationDto) => void;
  'support:conversation:read': (payload: { conversationId: string; adminUnreadCount: number; customerUnreadCount: number }) => void;
  'support:conversation:status': (payload: { conversationId: string; status: SupportStatus; closedAt: string | null }) => void;
}

export interface SupportClientEvents {
  'support:join': (conversationId: string, acknowledge?: (result: { ok: boolean }) => void) => void;
}
