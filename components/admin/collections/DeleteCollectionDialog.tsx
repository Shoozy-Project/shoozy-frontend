'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

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
import { collectionsApi } from '@/lib/api/collections';
import { useTranslations } from '@/lib/hooks/use-translations';

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
}

const DeleteCollectionDialog = ({
  open,
  onOpenChange,
  collectionId,
  collectionName,
}: DeleteCollectionDialogProps) => {
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => collectionsApi.delete(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(t('admin.collectionDeleted', { name: collectionName }));
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t('admin.collectionDeleteError'));
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
              {t('admin.collectionDeleteTitle')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
            {t('admin.collectionDeleteCopy', { name: collectionName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            id={`confirm-delete-collection-${collectionId}`}
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                {t('common.deleting')}
              </>
            ) : (
              t('admin.collectionDeleteTitle')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCollectionDialog;
