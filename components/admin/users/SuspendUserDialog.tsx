'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
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
import { adminUsersApi } from '@/lib/api/users';
import type { UserDto } from '@/types/user';

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
}

const SuspendUserDialog = ({
  open,
  onOpenChange,
  user,
}: SuspendUserDialogProps) => {
  const queryClient = useQueryClient();

  const userId = user?.id ?? '';
  const isCurrentActive = user?.status === 'ACTIVE';
  const targetStatus = isCurrentActive ? 'INACTIVE' : 'ACTIVE';
  const userName = user?.fullName ?? user?.email ?? '';

  const toggleMutation = useMutation({
    mutationFn: () => adminUsersApi.toggleStatus(userId, { status: targetStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        targetStatus === 'INACTIVE'
          ? `User "${userName}" has been deactivated.`
          : `User "${userName}" has been activated.`
      );
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update account status.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      onOpenChange(false);
    },
  });

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isCurrentActive ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              }`}
            >
              {isCurrentActive ? (
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <AlertDialogTitle className="text-base font-semibold">
              {isCurrentActive ? 'Deactivate User Account' : 'Reactivate User Account'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
            {isCurrentActive ? (
              <>
                Are you sure you want to deactivate{' '}
                <span className="font-semibold text-black">"{user.fullName}"</span> ({user.email})?
                This will suspend their dashboard / store access.
              </>
            ) : (
              <>
                Are you sure you want to reactivate{' '}
                <span className="font-semibold text-black">"{user.fullName}"</span> ({user.email})?
                This will restore active login privileges.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={toggleMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            id={`confirm-toggle-user-${user.id}`}
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={`flex-1 sm:flex-none text-white flex items-center justify-center gap-2 ${
              isCurrentActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {toggleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Updating...
              </>
            ) : isCurrentActive ? (
              'Deactivate Account'
            ) : (
              'Reactivate Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendUserDialog;
