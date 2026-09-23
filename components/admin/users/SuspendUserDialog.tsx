'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminCustomersApi } from '@/lib/api/users';
import type { CustomerDto } from '@/types/user';
import { useTranslations } from '@/lib/hooks/use-translations';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; user: CustomerDto | null }

export default function SuspendUserDialog({ open, onOpenChange, user }: Props) {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const targetStatus = user?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const mutation = useMutation({
    mutationFn: () => adminCustomersApi.setStatus(user!.id, targetStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t(targetStatus === 'ACTIVE' ? 'admin.customerActivated' : 'admin.customerDeactivated'));
      onOpenChange(false);
    },
    onError: () => toast.error(t('admin.customerStatusError')),
  });
  if (!user) return null;
  const active = user.status === 'ACTIVE';
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              {active ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <AlertDialogTitle>{t(active ? 'admin.deactivateTitle' : 'admin.reactivateTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('admin.confirmCustomerStatus', { action: t(active ? 'admin.deactivate' : 'admin.reactivate'), name: `${user.firstName} ${user.lastName}`, email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending} className={active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}>
            {mutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
            {t(active ? 'admin.deactivate' : 'admin.reactivate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
