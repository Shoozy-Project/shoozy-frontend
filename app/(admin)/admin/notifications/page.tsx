import { NotificationInbox } from '@/components/notifications/NotificationInbox';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.notifications', 'meta.notificationsDescription');

export default function AdminNotificationsPage() {
  return <NotificationInbox admin />;
}
