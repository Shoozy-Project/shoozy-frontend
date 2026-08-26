import type { Metadata } from 'next';
import CollectionsClient from '@/components/admin/collections/CollectionsClient';

export const metadata: Metadata = {
  title: 'Collections | Shoezy Admin',
  description: 'Group products into custom thematic, seasonal, or promotional collections.',
};

export default function AdminCollectionsPage() {
  return <CollectionsClient />;
}
