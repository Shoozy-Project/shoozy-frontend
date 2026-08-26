import type { Metadata } from 'next';
import AddProductForm from '@/components/admin/AddProductForm';

export const metadata: Metadata = {
  title: 'Add New Product | Shoezy Admin',
  description: 'Add a new premium shoe variant and options to the Shoezy catalog.',
};

export default function AddProductPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <AddProductForm />
    </div>
  );
}
