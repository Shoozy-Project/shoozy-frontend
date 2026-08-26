'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { isAxiosError } from 'axios';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { productsApi } from '@/lib/api/products';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

const DeleteProductDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
}: DeleteProductDialogProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(`Product "${productName}" has been removed from catalog.`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to delete product.');
      } else {
        toast.error('An unexpected error occurred while deleting product.');
      }
      onOpenChange(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-base font-semibold text-gray-900">
              Delete Product Listing
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-black">"{productName}"</span>?
            This will unpublish the product, remove its variant mappings, and move it to archived state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            id={`confirm-delete-product-${productId}`}
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Delete Product'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;
