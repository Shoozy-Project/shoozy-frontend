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
import { brandsApi } from '@/lib/api/brands';

interface DeleteBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

const DeleteBrandDialog = ({
  open,
  onOpenChange,
  brandId,
  brandName,
}: DeleteBrandDialogProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => brandsApi.delete(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(`Brand "${brandName}" has been deleted.`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.error?.message ?? 'Failed to delete brand.';
        toast.error(msg);
      } else {
        toast.error('An unexpected error occurred.');
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
            <AlertDialogTitle className="text-base font-semibold">
              Delete Partner Brand
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-black">"{brandName}"</span>? This action
            cannot be undone and will unlink the brand from products.
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
            id={`confirm-delete-brand-${brandId}`}
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
              'Delete Brand'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBrandDialog;
