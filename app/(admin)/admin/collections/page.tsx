import CollectionsClient from '@/components/admin/collections/CollectionsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.productCollections', 'meta.adminCollectionsDescription');

export default function AdminCollectionsPage() {
  return <CollectionsClient />;
}
