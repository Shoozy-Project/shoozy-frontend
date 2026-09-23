'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Award,
} from 'lucide-react';
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

import { createBrandSchema, type BrandFormInput } from '@/validations/brand';
import { brandsApi } from '@/lib/api/brands';
import type { BrandDto } from '@/types/brand';
import { useTranslations } from '@/lib/hooks/use-translations';

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: BrandDto | null;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const BrandFormModal = ({ open, onOpenChange, editTarget }: BrandFormModalProps) => {
  const { locale, t } = useTranslations();
  const brandSchema = useMemo(() => createBrandSchema(locale), [locale]);
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Logo & Product Selector State ─────────────────────────

  // ─── Fetch Products for Multi-select Selector ──────────────

  // ─── Search & Selection Memoization ─────────────────────────

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BrandFormInput>({
    resolver: zodResolver(brandSchema) as import('react-hook-form').Resolver<BrandFormInput>,
    defaultValues: {
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      descriptionAr: '',
      logoUrl: '',
      isActive: true,
    },
  });

  // ─── Populate Form on Edit ──────────────────────────────────
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.translations?.en?.name ?? editTarget.name,
        nameAr: editTarget.translations?.ar?.name ?? '',
        slug: editTarget.slug,
        description: editTarget.translations?.en?.description ?? editTarget.description ?? '',
        descriptionAr: editTarget.translations?.ar?.description ?? '',
        logoUrl: editTarget.logoUrl ?? '',
        isActive: editTarget.isActive,
      });
    } else if (open && !editTarget) {
      reset({
        name: '',
        nameAr: '',
        slug: '',
        description: '',
        descriptionAr: '',
        logoUrl: '',
        isActive: true,
      });
    }
  }, [open, editTarget, reset]);

  // ─── Auto-generate Slug (create mode only) ──────────────────
  const nameValue = useWatch({ control, name: 'name' });
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = useWatch({ control, name: 'isActive' });
  const logoUrlValue = useWatch({ control, name: 'logoUrl' });
  const nameArValue = useWatch({ control, name: 'nameAr' });

  const translations = (data: BrandFormInput, creating: boolean) => {
    const en = { name: data.name.trim(), description: data.description?.trim() || null };
    const arabicName = data.nameAr?.trim();
    if (arabicName) return { en, ar: { name: arabicName, description: data.descriptionAr?.trim() || null } };
    return creating ? undefined : { en };
  };

  // ─── Handle File Selection ─────────────────────────────────
  // ─── Create Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: BrandFormInput) =>
      brandsApi.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
        translations: translations(data, true),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(t('admin.brandCreated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: () => toast.error(t('admin.brandCreateError')),
  });

  // ─── Update Mutation ────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: BrandFormInput) =>
      brandsApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
        translations: translations(data, false),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(t('admin.brandUpdated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: () => toast.error(t('admin.brandUpdateError')),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: BrandFormInput) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                {t(isEdit ? 'admin.editBrand' : 'admin.addPartnerBrand')}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {t(isEdit ? 'admin.updateBrandDetails' : 'admin.fillBrandDetails')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="brand-form">
          <div className="px-6 py-5 space-y-5">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.localizedBrandInfo')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="brand-name">{t('admin.englishName')} <span className="text-red-500">*</span></Label>
                  <Input id="brand-name" lang="en" placeholder="e.g. Nike" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="brand-name-ar">{t('admin.arabicName')}</Label>
                  <Input id="brand-name-ar" lang="ar" placeholder="مثال: نايك" {...register('nameAr')} />
                  {errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}
                </div>
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="brand-description">{t('admin.englishDescription')}</Label>
                  <textarea id="brand-description" lang="en" rows={3} placeholder="Athletic and lifestyle wear." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('description')} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="brand-description-ar">{t('admin.arabicDescription')}</Label>
                  <textarea id="brand-description-ar" lang="ar" rows={3} placeholder="ملابس وأحذية رياضية." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('descriptionAr')} />
                  {errors.descriptionAr && <p className="text-xs text-red-500">{errors.descriptionAr.message}</p>}
                </div>
              </div>
              {!nameArValue?.trim() && <p className="mt-3 text-[11px] text-gray-400">{t('admin.arabicOptional')}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="brand-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.slug')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand-slug"
                placeholder="e.g. nike"
                className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('slug')}
              />
              <p className="text-[11px] text-gray-400">{t('admin.slugHint')}</p>
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* Brand Logo URL */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.brandLogo')} <span className="text-gray-400 font-normal">{t('admin.optional')}</span>
              </Label>
              <div className="space-y-2">
                <Input
                  id="brand-logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                  {...register('logoUrl')}
                />
                {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
                {logoUrlValue && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <CommerceImage
                      src={logoUrlValue}
                      alt={t('admin.logoPreview')}
                      sizes="640px"
                      className="object-contain p-2"
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
                    ? t('admin.brandActiveCopy')
                    : t('admin.brandInactiveCopy')}
                </p>
              </div>
              <Switch
                id="brand-isActive"
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
              form="brand-form"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t(isEdit ? 'admin.saving' : 'admin.creating')}
                </>
              ) : isEdit ? (
                t('admin.saveChanges')
              ) : (
                t('admin.createBrand')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrandFormModal;
