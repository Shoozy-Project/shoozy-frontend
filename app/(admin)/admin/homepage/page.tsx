import { HomepageBannersClient } from '@/components/admin/homepage/HomepageBannersClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('homepage.adminTitle', 'homepage.adminCopy');

export default function AdminHomepagePage() {
  return <HomepageBannersClient />;
}
