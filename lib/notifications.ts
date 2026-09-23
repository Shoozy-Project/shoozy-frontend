import type { Locale } from '@/lib/i18n';
import type { NotificationDto } from '@/types/notifications';

const statusLabels: Record<Locale, Record<string, string>> = {
  en: {
    APPROVED: 'approved', REJECTED: 'rejected',
    RECEIVED_AND_REFUNDED: 'received and refunded', COMPLETED: 'completed',
  },
  ar: {
    APPROVED: 'تمت الموافقة عليه', REJECTED: 'تم رفضه',
    RECEIVED_AND_REFUNDED: 'تم استلامه ورد قيمته', COMPLETED: 'اكتمل',
  },
};

type Template = (params: Record<string, string>) => { title: string; message: string };

const templates: Record<Locale, Record<string, Template>> = {
  en: {
    ORDER_CREATED: (p) => ({ title: `New order #${p.orderNumber}`, message: 'A new order has been placed.' }),
    ORDER_CONFIRMED: (p) => ({ title: `Order #${p.orderNumber} confirmed`, message: `Your order #${p.orderNumber} has been confirmed.` }),
    ORDER_SHIPPED: (p) => ({ title: `Order #${p.orderNumber} shipped`, message: `Your order #${p.orderNumber} has been shipped.` }),
    ORDER_DELIVERED: (p) => ({ title: `Order #${p.orderNumber} delivered`, message: `Your order #${p.orderNumber} has been delivered.` }),
    ORDER_CANCELLED: (p) => ({ title: `Order #${p.orderNumber} cancelled`, message: `Your order #${p.orderNumber} has been cancelled.` }),
    ORDER_CANCELLED_ADMIN: (p) => ({ title: `Order #${p.orderNumber} cancelled`, message: 'An order has been cancelled.' }),
    RETURN_REQUESTED: (p) => ({ title: `Return ${p.returnNumber} requested`, message: 'A customer submitted a return request.' }),
    RETURN_STATUS_UPDATED: (p) => ({ title: `Return ${p.returnNumber} updated`, message: `Your return request is now ${statusLabels.en[p.status] ?? p.status}.` }),
    EXCHANGE_REQUESTED: (p) => ({ title: `Exchange ${p.exchangeNumber} requested`, message: 'A customer submitted an exchange request.' }),
    EXCHANGE_STATUS_UPDATED: (p) => ({ title: `Exchange ${p.exchangeNumber} updated`, message: `Your exchange request is now ${statusLabels.en[p.status] ?? p.status}.` }),
    REVIEW_PENDING: () => ({ title: 'Review awaiting moderation', message: 'A new product review requires moderation.' }),
    LOW_STOCK: (p) => ({ title: `Low stock: ${p.sku}`, message: `${p.sku} has ${p.stockQuantity} units remaining.` }),
  },
  ar: {
    ORDER_CREATED: (p) => ({ title: `طلب جديد رقم ${p.orderNumber}`, message: 'تم تقديم طلب جديد.' }),
    ORDER_CONFIRMED: (p) => ({ title: `تم تأكيد الطلب رقم ${p.orderNumber}`, message: `تم تأكيد طلبك رقم ${p.orderNumber}.` }),
    ORDER_SHIPPED: (p) => ({ title: `تم شحن الطلب رقم ${p.orderNumber}`, message: `تم شحن طلبك رقم ${p.orderNumber}.` }),
    ORDER_DELIVERED: (p) => ({ title: `تم توصيل الطلب رقم ${p.orderNumber}`, message: `تم توصيل طلبك رقم ${p.orderNumber}.` }),
    ORDER_CANCELLED: (p) => ({ title: `تم إلغاء الطلب رقم ${p.orderNumber}`, message: `تم إلغاء طلبك رقم ${p.orderNumber}.` }),
    ORDER_CANCELLED_ADMIN: (p) => ({ title: `تم إلغاء الطلب رقم ${p.orderNumber}`, message: 'تم إلغاء أحد الطلبات.' }),
    RETURN_REQUESTED: (p) => ({ title: `طلب إرجاع رقم ${p.returnNumber}`, message: 'قدّم عميل طلب إرجاع.' }),
    RETURN_STATUS_UPDATED: (p) => ({ title: `تحديث الإرجاع رقم ${p.returnNumber}`, message: `طلب الإرجاع الخاص بك ${statusLabels.ar[p.status] ?? p.status}.` }),
    EXCHANGE_REQUESTED: (p) => ({ title: `طلب استبدال رقم ${p.exchangeNumber}`, message: 'قدّم عميل طلب استبدال.' }),
    EXCHANGE_STATUS_UPDATED: (p) => ({ title: `تحديث الاستبدال رقم ${p.exchangeNumber}`, message: `طلب الاستبدال الخاص بك ${statusLabels.ar[p.status] ?? p.status}.` }),
    REVIEW_PENDING: () => ({ title: 'تقييم بانتظار المراجعة', message: 'يوجد تقييم منتج جديد يحتاج إلى المراجعة.' }),
    LOW_STOCK: (p) => ({ title: `مخزون منخفض: ${p.sku}`, message: `تبقى من ${p.sku} عدد ${p.stockQuantity} وحدات.` }),
  },
};

export function localizeNotification(notification: NotificationDto, locale: Locale): NotificationDto {
  const render = templates[locale][notification.templateKey];
  return render ? { ...notification, ...render(notification.templateParams) } : notification;
}

export function notificationHref(notification: NotificationDto, admin: boolean): string | null {
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notification.entityId);
  if (!validId) return null;
  if (admin) {
    if (notification.entityType === 'ORDER') {
      return `/admin/orders?notificationOrder=${encodeURIComponent(notification.entityId)}`;
    }
    if (notification.entityType === 'REVIEW') return '/admin/reviews';
    if (notification.entityType === 'PRODUCT_VARIANT') return '/admin/products';
    return null;
  }

  if (notification.entityType === 'ORDER') return `/account/orders/${encodeURIComponent(notification.entityId)}`;
  if (notification.entityType === 'RETURN') return `/account/returns/${encodeURIComponent(notification.entityId)}`;
  if (notification.entityType === 'EXCHANGE') return `/account/exchanges/${encodeURIComponent(notification.entityId)}`;
  return null;
}
