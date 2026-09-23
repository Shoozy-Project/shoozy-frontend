'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { isAxiosError } from 'axios';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminCustomersApi } from '@/lib/api/users';
import type { CustomerDto } from '@/types/user';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; user: CustomerDto | null }

export default function SuspendUserDialog({ open, onOpenChange, user }: Props) {
  const queryClient = useQueryClient();
  const targetStatus = user?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const mutation = useMutation({
    mutationFn: () => adminCustomersApi.setStatus(user!.id, targetStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Customer account ${targetStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
      onOpenChange(false);
    },
    onError: (error) => toast.error(isAxiosError(error) ? error.response?.data?.error?.message ?? 'Failed to update customer status.' : 'Failed to update customer status.'),
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
            <AlertDialogTitle>{active ? 'Deactivate Customer Account' : 'Reactivate Customer Account'}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {active ? 'Deactivate' : 'Reactivate'} <span className="font-semibold text-black">{user.firstName} {user.lastName}</span> ({user.email})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} disabled={mutation.isPending} className={active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}>
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {active ? 'Deactivate' : 'Reactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
