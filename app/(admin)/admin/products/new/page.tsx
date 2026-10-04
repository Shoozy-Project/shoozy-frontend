import AddProductForm from '@/components/admin/AddProductForm';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.addProduct', 'meta.adminProductEditorDescription');

export default async function AddProductPage({ searchParams }: PageProps<'/admin/products/new'>) {
  const { edit } = await searchParams;
  return (
    <div className="max-w-7xl mx-auto py-2">
      <AddProductForm productId={typeof edit === 'string' ? edit : undefined} />
    </div>
  );
}
