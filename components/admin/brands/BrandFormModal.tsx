'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
const ACCEPTED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function BrandFormModal({ open, onOpenChange, editTarget }: BrandFormModalProps) {
  const { locale, t } = useTranslations();
  const schema = useMemo(() => createBrandSchema(locale), [locale]);
  const queryClient = useQueryClient();
  const isEdit = Boolean(editTarget);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showcaseImageFile, setShowcaseImageFile] = useState<File | null>(null);
  const [showcaseRemoved, setShowcaseRemoved] = useState(false);

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<BrandFormInput>({
    resolver: zodResolver(schema) as import('react-hook-form').Resolver<BrandFormInput>,
    defaultValues: { name: '', nameAr: '', slug: '', description: '', descriptionAr: '', logoUrl: '', showcaseImageUrl: '', isActive: true },
  });
  const name = useWatch({ control, name: 'name' });
  const isActive = useWatch({ control, name: 'isActive' });
  const nameAr = useWatch({ control, name: 'nameAr' });
  const logoPreviewUrl = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : editTarget?.logoUrl ?? null, [editTarget?.logoUrl, imageFile]);
  const showcasePreviewUrl = useMemo(
    () => showcaseImageFile ? URL.createObjectURL(showcaseImageFile) : showcaseRemoved ? null : editTarget?.showcaseImageUrl ?? null,
    [editTarget?.showcaseImageUrl, showcaseImageFile, showcaseRemoved],
  );

  useEffect(() => () => { if (imageFile && logoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl); }, [imageFile, logoPreviewUrl]);
  useEffect(() => () => { if (showcaseImageFile && showcasePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(showcasePreviewUrl); }, [showcaseImageFile, showcasePreviewUrl]);

  /* eslint-disable react-hooks/set-state-in-effect -- Opening the modal hydrates its local file state from the selected record. */
  useEffect(() => {
    if (!open) return;
    setImageFile(null);
    setShowcaseImageFile(null);
    setShowcaseRemoved(false);
    reset(editTarget ? {
      name: editTarget.translations?.en?.name ?? editTarget.name,
      nameAr: editTarget.translations?.ar?.name ?? '',
      slug: editTarget.slug,
      description: editTarget.translations?.en?.description ?? editTarget.description ?? '',
      descriptionAr: editTarget.translations?.ar?.description ?? '',
      logoUrl: editTarget.logoUrl ?? '',
      showcaseImageUrl: editTarget.showcaseImageUrl ?? '',
      isActive: editTarget.isActive,
    } : { name: '', nameAr: '', slug: '', description: '', descriptionAr: '', logoUrl: '', showcaseImageUrl: '', isActive: true });
  }, [editTarget, open, reset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isEdit) setValue('slug', generateSlug(name ?? ''), { shouldValidate: false });
  }, [isEdit, name, setValue]);

  const translations = (data: BrandFormInput, creating: boolean) => {
    const en = { name: data.name.trim(), description: data.description?.trim() || null };
    const arabicName = data.nameAr?.trim();
    if (arabicName) return { en, ar: { name: arabicName, description: data.descriptionAr?.trim() || null } };
    return creating ? undefined : { en };
  };

  const save = useMutation({
    mutationFn: (data: BrandFormInput) => {
      const payload = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || null,
        isActive: data.isActive,
        translations: translations(data, !isEdit),
        ...(showcaseRemoved ? { showcaseImageUrl: null } : {}),
      };
      return editTarget
        ? brandsApi.update(editTarget.id, payload, imageFile, showcaseImageFile)
        : brandsApi.create(payload, imageFile, showcaseImageFile);
    },
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(t(editTarget ? 'admin.brandUpdated' : 'admin.brandCreated', { name: response.data.data.name }));
      onOpenChange(false);
    },
    onError: () => toast.error(t(editTarget ? 'admin.brandUpdateError' : 'admin.brandCreateError')),
  });

  const chooseImage = (file: File | undefined, target: 'logo' | 'showcase') => {
    if (!file) return;
    if (!ACCEPTED_IMAGES.has(file.type)) return toast.error(t('admin.brandImageType'));
    if (file.size > 8 * 1024 * 1024) return toast.error(t('admin.brandImageSize'));
    if (target === 'logo') setImageFile(file);
    else {
      setShowcaseImageFile(file);
      setShowcaseRemoved(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]">
        <DialogHeader className="sticky top-0 z-10 border-b bg-card px-6 py-5">
          <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30"><Award className="size-5 text-[#FF8C00]" /></div><div><DialogTitle>{t(isEdit ? 'admin.editBrand' : 'admin.addPartnerBrand')}</DialogTitle><DialogDescription>{t(isEdit ? 'admin.updateBrandDetails' : 'admin.fillBrandDetails')}</DialogDescription></div></div>
        </DialogHeader>
        <form id="brand-form" onSubmit={handleSubmit((data) => save.mutate(data))}>
          <div className="space-y-5 px-6 py-5">
            <section className="rounded-xl border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('admin.localizedBrandInfo')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5" dir="ltr"><Label htmlFor="brand-name">{t('admin.englishName')} *</Label><Input id="brand-name" lang="en" {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
                <div className="space-y-1.5" dir="rtl"><Label htmlFor="brand-name-ar">{t('admin.arabicName')}</Label><Input id="brand-name-ar" lang="ar" {...register('nameAr')} />{errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}</div>
                <div className="space-y-1.5" dir="ltr"><Label htmlFor="brand-description">{t('admin.englishDescription')}</Label><textarea id="brand-description" lang="en" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register('description')} /></div>
                <div className="space-y-1.5" dir="rtl"><Label htmlFor="brand-description-ar">{t('admin.arabicDescription')}</Label><textarea id="brand-description-ar" lang="ar" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register('descriptionAr')} /></div>
              </div>
              {!nameAr?.trim() && <p className="mt-3 text-[11px] text-muted-foreground">{t('admin.arabicOptional')}</p>}
            </section>
            <div className="space-y-1.5"><Label htmlFor="brand-slug">{t('admin.slug')} *</Label><Input id="brand-slug" className="font-mono" {...register('slug')} />{errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}</div>

            <section className="space-y-3">
              <Label htmlFor="brand-image">{t('admin.brandLogo')} <span className="font-normal text-muted-foreground">{t('admin.optional')}</span></Label>
              <label htmlFor="brand-image" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center hover:border-[#FF8C00]">
                <input id="brand-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={save.isPending} onChange={(event) => chooseImage(event.target.files?.[0], 'logo')} />
                <UploadCloud className="mb-2 size-6 text-muted-foreground" /><span className="text-sm font-medium">{t(imageFile || logoPreviewUrl ? 'admin.replaceBrandLogo' : 'admin.uploadBrandLogo')}</span><span className="mt-1 text-xs text-muted-foreground">{t('admin.brandImageHelp')}</span>
              </label>
              {logoPreviewUrl && <div className="relative mx-auto aspect-[2/1] w-full max-w-xs overflow-hidden rounded-lg border bg-white p-4 dark:bg-neutral-950"><Image src={logoPreviewUrl} alt={t('admin.logoPreview')} fill unoptimized className="object-contain p-4" /></div>}
            </section>

            <section className="space-y-3">
              <Label htmlFor="brand-showcase-image">{t('admin.brandShowcaseImage')} <span className="font-normal text-muted-foreground">{t('admin.optional')}</span></Label>
              <label htmlFor="brand-showcase-image" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center hover:border-[#FF8C00]">
                <input id="brand-showcase-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={save.isPending} onChange={(event) => chooseImage(event.target.files?.[0], 'showcase')} />
                <UploadCloud className="mb-2 size-6 text-muted-foreground" />
                <span className="text-sm font-medium">{t(showcasePreviewUrl ? 'admin.replaceBrandShowcase' : 'admin.uploadBrandShowcase')}</span>
                <span className="mt-1 text-xs text-muted-foreground">{t('admin.brandShowcaseHelp')}</span>
              </label>
              {showcasePreviewUrl && (
                <div className="mx-auto w-full max-w-[220px] space-y-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                    <Image src={showcasePreviewUrl} alt={t('admin.showcasePreview')} fill unoptimized className="object-cover" />
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full" disabled={save.isPending} onClick={() => { setShowcaseImageFile(null); setShowcaseRemoved(true); }}>
                    <Trash2 className="size-4" aria-hidden="true" />{t('admin.removeBrandShowcase')}
                  </Button>
                </div>
              )}
            </section>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"><div><p className="text-sm font-medium">{t('admin.activeStatus')}</p><p className="text-xs text-muted-foreground">{t(isActive ? 'admin.brandActiveCopy' : 'admin.brandInactiveCopy')}</p></div><Switch checked={isActive} onCheckedChange={(value) => setValue('isActive', value)} aria-label={t('admin.toggleActiveStatus')} /></div>
          </div>
          <DialogFooter className="sticky bottom-0 border-t bg-card px-6 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={save.isPending}>{t('common.cancel')}</Button><Button type="submit" disabled={save.isPending} className="bg-[#FF8C00] text-white hover:bg-[#e67e00]">{save.isPending && <Loader2 className="size-4 animate-spin" />}{t(isEdit ? 'admin.saveChanges' : 'admin.createBrand')}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
