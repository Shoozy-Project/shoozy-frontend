import { NotificationInbox } from '@/components/notifications/NotificationInbox';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('account.notifications', 'meta.notificationsDescription');

export default function AccountNotificationsPage() {
  return <NotificationInbox />;
}
