'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Link as LinkIcon,
  Tag,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { CommerceImage } from '@/components/commerce/CommerceImage';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { createCategorySchema, type CategoryFormInput } from '@/validations/category';
import { categoriesApi } from '@/lib/api/categories';
import type { CategoryDto } from '@/types/category';
import { useTranslations } from '@/lib/hooks/use-translations';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: CategoryDto | null;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const CategoryFormModal = ({ open, onOpenChange, editTarget }: CategoryFormModalProps) => {
  const { locale, t } = useTranslations();
  const categorySchema = useMemo(() => createCategorySchema(locale), [locale]);
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Image upload state ──────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema) as import('react-hook-form').Resolver<CategoryFormInput>,
    defaultValues: {
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      descriptionAr: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
      parentId: null,
    },
  });

  // ─── Populate form when editing ──────────────────────────────
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.translations?.en?.name ?? editTarget.name,
        nameAr: editTarget.translations?.ar?.name ?? '',
        slug: editTarget.slug,
        description: editTarget.translations?.en?.description ?? editTarget.description ?? '',
        descriptionAr: editTarget.translations?.ar?.description ?? '',
        imageUrl: editTarget.imageUrl ?? '',
        sortOrder: editTarget.sortOrder,
        isActive: editTarget.isActive,
        parentId: editTarget.parentId ?? null,
      });
    } else if (open && !editTarget) {
      reset({
        name: '',
        nameAr: '',
        slug: '',
        description: '',
        descriptionAr: '',
        imageUrl: '',
        sortOrder: 0,
        isActive: true,
        parentId: null,
      });
    }
  }, [open, editTarget, reset]);

  // ─── Auto-generate slug from name (create only) ──────────────
  const nameValue = useWatch({ control, name: 'name' });
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = useWatch({ control, name: 'isActive' });
  const imageUrlValue = useWatch({ control, name: 'imageUrl' });
  const nameArValue = useWatch({ control, name: 'nameAr' });

  const translations = (data: CategoryFormInput, creating: boolean) => {
    const en = { name: data.name.trim(), description: data.description?.trim() || null };
    const arabicName = data.nameAr?.trim();
    if (arabicName) return { en, ar: { name: arabicName, description: data.descriptionAr?.trim() || null } };
    return creating ? undefined : { en };
  };

  // ─── Resolved preview — file takes precedence ────────────────
  // ─── Handle local file selection ─────────────────────────────
  // ─── Upload file to backend, returns URL ─────────────────────
  // ─── Create mutation ─────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormInput) =>
      categoriesApi.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
        parentId: data.parentId || null,
        translations: translations(data, true),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin.categoryCreated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'AUTH_PERMISSION_DENIED' || err.response?.status === 403) {
          toast.error(t('admin.permissionDenied'));
        } else {
          toast.error(t('admin.categoryCreateError'));
        }
      } else {
        toast.error(t('admin.categoryCreateError'));
      }
    },
  });

  // ─── Update mutation ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormInput) =>
      categoriesApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
        parentId: data.parentId || null,
        translations: translations(data, false),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('admin.categoryUpdated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'AUTH_PERMISSION_DENIED' || err.response?.status === 403) {
          toast.error(t('admin.permissionDenied'));
        } else {
          toast.error(t('admin.categoryUpdateError'));
        }
      } else {
        toast.error(t('admin.categoryUpdateError'));
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CategoryFormInput) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                {t(isEdit ? 'admin.editCategory' : 'admin.addNewCategory')}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {t(isEdit ? 'admin.updateCategoryDetails' : 'admin.fillCategoryDetails')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="category-form">
          <div className="px-6 py-5 space-y-5">

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.localizedCategoryInfo')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="cat-name">{t('admin.englishName')} <span className="text-red-500">*</span></Label>
                  <Input id="cat-name" lang="en" placeholder="e.g. Running Shoes" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="cat-name-ar">{t('admin.arabicName')}</Label>
                  <Input id="cat-name-ar" lang="ar" placeholder="مثال: أحذية الجري" {...register('nameAr')} />
                  {errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}
                </div>
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="cat-description">{t('admin.englishDescription')}</Label>
                  <textarea id="cat-description" lang="en" rows={3} placeholder="A brief description..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('description')} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="cat-description-ar">{t('admin.arabicDescription')}</Label>
                  <textarea id="cat-description-ar" lang="ar" rows={3} placeholder="وصف موجز للتصنيف..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('descriptionAr')} />
                  {errors.descriptionAr && <p className="text-xs text-red-500">{errors.descriptionAr.message}</p>}
                </div>
              </div>
              {!nameArValue?.trim() && <p className="mt-3 text-[11px] text-gray-400">{t('admin.arabicOptional')}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.slug')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-slug"
                placeholder="e.g. running-shoes"
                className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('slug')}
              />
              <p className="text-[11px] text-gray-400">{t('admin.slugHint')}</p>
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* ─── Category Image ─────────────────────────────── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.categoryImage')} <span className="text-gray-400 font-normal">{t('admin.optional')}</span>
              </Label>

              <div className="space-y-2">
                <div className="relative flex items-center gap-2">
                  <div className="absolute start-3 text-gray-400">
                    <LinkIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <Input
                    id="cat-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="ps-9 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                    {...register('imageUrl')}
                  />
                </div>
                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                {imageUrlValue && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <CommerceImage
                      src={imageUrlValue}
                      alt={t('admin.imagePreview')}
                      sizes="640px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-black">{t('admin.activeStatus')}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isActiveValue
                    ? t('admin.categoryActiveCopy')
                    : t('admin.categoryInactiveCopy')}
                </p>
              </div>
              <Switch
                id="cat-isActive"
                checked={isActiveValue}
                onCheckedChange={(val) => setValue('isActive', val)}
                className="data-[state=checked]:bg-[#FF8C00]"
                aria-label={t('admin.toggleActiveStatus')}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3 sticky bottom-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              form="category-form"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  {t(isEdit ? 'admin.saving' : 'admin.creating')}
                </>
              ) : isEdit ? (
                t('admin.saveChanges')
              ) : (
                t('admin.createCategory')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormModal;
