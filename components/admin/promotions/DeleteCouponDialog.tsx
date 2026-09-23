'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { useTranslations } from '@/lib/hooks/use-translations';

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
  const { t } = useTranslations();

  const mutation = useMutation({
    mutationFn: () => promotionsApi.deleteCoupon(coupon!.id),
    onSuccess: () => {
      toast.success(t('promotion.deleteSuccess', { name: coupon?.code ?? coupon?.name ?? '' }));
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      onClose();
    },
    onError: () => {
      toast.error(t('promotion.deleteError'));
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent className="bg-card border shadow-2xl rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900">
            {t('promotion.deleteTitle', { name: coupon?.code ?? coupon?.name ?? '' })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-gray-500">
            {t('promotion.deleteCopy')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onClose} className="text-xs border-gray-200">
            {t('common.cancel')}
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
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                {t('promotion.deleting')}
              </>
            ) : (
              t('promotion.deleteAction')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
