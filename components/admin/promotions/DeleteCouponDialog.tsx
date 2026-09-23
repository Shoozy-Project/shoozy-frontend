'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

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

import { promotionsApi, type CouponDto } from '@/lib/api/promotions';

interface DeleteCouponDialogProps {
  coupon: CouponDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteCouponDialog({
  coupon,
  isOpen,
  onClose,
}: DeleteCouponDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => promotionsApi.deleteCoupon(coupon!.id),
    onSuccess: () => {
      toast.success(`Discount '${coupon?.code ?? coupon?.name}' deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      onClose();
    },
    onError: (err) => {
      let msg = 'Failed to delete coupon';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-white border border-gray-100 shadow-2xl rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900">
            Delete Discount <span className="font-mono text-[#FF8C00]">{coupon?.code ?? coupon?.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-gray-500">
            This action cannot be undone. The discount will no longer be available at checkout.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose} className="text-xs border-gray-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Coupon'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
