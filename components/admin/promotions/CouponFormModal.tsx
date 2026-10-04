'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PromotionTargetSelector } from './PromotionTargetSelector';
import {
  promotionsApi,
  type CouponDto,
  type DiscountActivationMode,
  type DiscountScope,
  type DiscountTargetInput,
  type DiscountType,
} from '@/lib/api/promotions';
import { formatMinorAmount, majorToMinorString } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: CouponDto | null;
}

function localDateTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function existingTargets(coupon?: CouponDto | null): DiscountTargetInput[] {
  return (coupon?.targets ?? []).reduce<DiscountTargetInput[]>((items, target) => {
    if (target.productId) items.push({ productId: target.productId });
    else if (target.variantId) items.push({ variantId: target.variantId });
    else if (target.categoryId) items.push({ categoryId: target.categoryId });
    else if (target.collectionId) items.push({ collectionId: target.collectionId });
    return items;
  }, []);
}

export default function CouponFormModal({ isOpen, onClose, couponToEdit }: CouponFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!couponToEdit;
  const { t } = useTranslations();
  const [name, setName] = useState(couponToEdit?.translations?.en?.name ?? couponToEdit?.name ?? '');
  const [nameAr, setNameAr] = useState(couponToEdit?.translations?.ar?.name ?? '');
  const [description, setDescription] = useState(couponToEdit?.translations?.en?.description ?? couponToEdit?.description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(couponToEdit?.translations?.ar?.description ?? '');
  const [activationMode, setActivationMode] = useState<DiscountActivationMode>(couponToEdit?.activationMode ?? 'AUTOMATIC');
  const [code, setCode] = useState(couponToEdit?.code ?? '');
  const [priority, setPriority] = useState(String(couponToEdit?.priority ?? 100));
  const [type, setType] = useState<DiscountType>(couponToEdit?.type ?? 'PERCENTAGE');
  const [scope, setScope] = useState<DiscountScope>(couponToEdit?.scope ?? 'CATALOG');
  const [targets, setTargets] = useState<DiscountTargetInput[]>(() => existingTargets(couponToEdit));
  const [valueInput, setValueInput] = useState(() => couponToEdit
    ? couponToEdit.type === 'FIXED_AMOUNT' ? formatMinorAmount(couponToEdit.value, 3) : String(Number(couponToEdit.value) / 100)
    : '10');
  const [minOrderInput, setMinOrderInput] = useState(() => couponToEdit?.minOrderMinor ? formatMinorAmount(couponToEdit.minOrderMinor, 3) : '');
  const [maxDiscountInput, setMaxDiscountInput] = useState(() => couponToEdit?.maxDiscountMinor ? formatMinorAmount(couponToEdit.maxDiscountMinor, 3) : '');
  const [usageLimitInput, setUsageLimitInput] = useState(couponToEdit?.usageLimit?.toString() ?? '');
  const [perCustomerInput, setPerCustomerInput] = useState(couponToEdit?.perCustomerLimit?.toString() ?? '');
  const [startsAt, setStartsAt] = useState(localDateTime(couponToEdit?.startsAt) || localDateTime(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(localDateTime(couponToEdit?.endsAt));
  const [isActive, setIsActive] = useState(couponToEdit?.isActive ?? true);
  const [combinable, setCombinable] = useState(couponToEdit?.combinable ?? false);
  const [showOnStorefront, setShowOnStorefront] = useState(couponToEdit?.showOnStorefront ?? false);
  const [sortOrder, setSortOrder] = useState(String(couponToEdit?.sortOrder ?? 0));
  const [ctaUrl, setCtaUrl] = useState(couponToEdit?.ctaUrl ?? '');
  const [image, setImage] = useState<File | null>(null);
  const imagePreview = useMemo(() => image ? URL.createObjectURL(image) : couponToEdit?.imageUrl ?? '', [couponToEdit?.imageUrl, image]);

  useEffect(() => () => { if (image && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); }, [image, imagePreview]);

  const mutation = useMutation({
    mutationFn: async () => {
      const value = type === 'FIXED_AMOUNT'
        ? majorToMinorString(valueInput, 3)
        : type === 'PERCENTAGE' ? String(Math.round((Number(valueInput) || 0) * 100)) : '0';
      const en = { name: name.trim(), description: description.trim() || null };
      const arName = nameAr.trim();
      const translations = arName
        ? { en, ar: { name: arName, description: descriptionAr.trim() || null } }
        : isEditing ? { en } : undefined;
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        ...(translations ? { translations } : {}),
        code: activationMode === 'COUPON' ? code.trim().toUpperCase() : null,
        type,
        scope: type === 'FREE_SHIPPING' ? 'ORDER' as const : scope,
        priority: Number.parseInt(priority, 10) || 0,
        value,
        currency: type === 'FIXED_AMOUNT' ? 'TND' : null,
        minOrderMinor: minOrderInput.trim() ? majorToMinorString(minOrderInput, 3) : null,
        maxDiscountMinor: type === 'PERCENTAGE' && maxDiscountInput.trim() ? majorToMinorString(maxDiscountInput, 3) : null,
        usageLimit: usageLimitInput.trim() ? Number.parseInt(usageLimitInput, 10) : null,
        perCustomerLimit: perCustomerInput.trim() ? Number.parseInt(perCustomerInput, 10) : null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        isActive,
        combinable,
        imageUrl: couponToEdit?.imageUrl ?? null,
        showOnStorefront,
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
        ctaUrl: ctaUrl.trim() || null,
        targets: type === 'FREE_SHIPPING' || scope === 'ORDER' || scope === 'CATALOG' ? [] : targets,
      };
      return isEditing && couponToEdit
        ? promotionsApi.updateCoupon(couponToEdit.id, payload, image)
        : promotionsApi.createCoupon(payload, image);
    },
    onSuccess: () => {
      toast.success(isEditing ? t('promotion.updated') : t('promotion.created'));
      void queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      onClose();
    },
    onError: () => toast.error(t('promotion.saveError')),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error(t('promotion.nameRequired'));
    if (activationMode === 'COUPON' && !code.trim()) return toast.error(t('promotion.codeRequired'));
    if (type !== 'FREE_SHIPPING' && !['ORDER', 'CATALOG'].includes(scope) && targets.length === 0) return toast.error(t('promotion.targetRequired'));
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) return toast.error(t('promotion.dateError'));
    mutation.mutate();
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error(t('promotion.imageTypeError'));
    if (file.size > 8 * 1024 * 1024) return toast.error(t('promotion.imageSizeError'));
    setImage(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="sticky top-0 z-10 border-b bg-card px-6 py-5">
          <div className="flex items-center gap-2 text-[#FF8C00]"><Tag className="size-5" /><DialogTitle className="text-xl text-foreground">{isEditing ? t('promotion.editTitle') : t('promotion.createTitle')}</DialogTitle></div>
          <DialogDescription>{t('promotion.editorCopy')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">{t('promotion.localizedInfo')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2" dir="ltr"><Label>{t('promotion.englishName')}</Label><Input lang="en" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} /><Label>{t('promotion.englishDescription')}</Label><textarea lang="en" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-md border bg-background p-3 text-sm" /></div>
              <div className="space-y-2" dir="rtl"><Label>{t('promotion.arabicName')}</Label><Input lang="ar" value={nameAr} onChange={(event) => setNameAr(event.target.value)} maxLength={150} /><Label>{t('promotion.arabicDescription')}</Label><textarea lang="ar" value={descriptionAr} onChange={(event) => setDescriptionAr(event.target.value)} rows={3} className="w-full rounded-md border bg-background p-3 text-sm" /></div>
            </div>
          </section>

          <section className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t('promotion.activationMode')}</Label><select value={activationMode} onChange={(event) => setActivationMode(event.target.value as DiscountActivationMode)} className="w-full rounded-md border bg-background px-3 py-2"><option value="AUTOMATIC">{t('promotion.automatic')}</option><option value="COUPON">{t('promotion.couponCodeMode')}</option></select></div>
            <div className="space-y-2"><Label>{t('promotion.priority')}</Label><Input type="number" min="0" value={priority} onChange={(event) => setPriority(event.target.value)} /><p className="text-xs text-muted-foreground">{t('promotion.priorityHelp')}</p></div>
            {activationMode === 'COUPON' && <div className="space-y-2 sm:col-span-2"><Label>{t('promotion.couponCode')}</Label><div className="relative"><Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={80} className="font-mono uppercase" dir="ltr" /><Sparkles className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[#FF8C00]" /></div></div>}
            <div className="space-y-2"><Label>{t('promotion.discountType')}</Label><select value={type} onChange={(event) => { const next = event.target.value as DiscountType; setType(next); if (next === 'FREE_SHIPPING') { setScope('ORDER'); setTargets([]); } }} className="w-full rounded-md border bg-background px-3 py-2"><option value="PERCENTAGE">{t('promotion.percentage')}</option><option value="FIXED_AMOUNT">{t('promotion.fixed')}</option><option value="FREE_SHIPPING">{t('promotion.freeShipping')}</option></select></div>
            <div className="space-y-2"><Label>{t('promotion.value')} {type === 'PERCENTAGE' ? '(%)' : type === 'FIXED_AMOUNT' ? '(TND)' : ''}</Label><Input type="number" min="0" step={type === 'FIXED_AMOUNT' ? '0.001' : '0.01'} value={type === 'FREE_SHIPPING' ? '0' : valueInput} onChange={(event) => setValueInput(event.target.value)} disabled={type === 'FREE_SHIPPING'} /><p className="text-xs text-muted-foreground">{t('promotion.valueHelp')}</p></div>
            <div className="space-y-2"><Label>{t('promotion.targetScope')}</Label><select value={type === 'FREE_SHIPPING' ? 'ORDER' : scope} disabled={type === 'FREE_SHIPPING'} onChange={(event) => { setScope(event.target.value as DiscountScope); setTargets([]); }} className="w-full rounded-md border bg-background px-3 py-2"><option value="CATALOG">{t('promotion.catalog')}</option><option value="PRODUCT">{t('promotion.products')}</option><option value="VARIANT">{t('promotion.variants')}</option><option value="CATEGORY">{t('promotion.categories')}</option><option value="COLLECTION">{t('promotion.collections')}</option><option value="ORDER">{t('promotion.order')}</option></select></div>
            <div className="space-y-2"><Label>{t('promotion.maxDiscount')}</Label><Input type="number" min="0" step="0.001" value={maxDiscountInput} onChange={(event) => setMaxDiscountInput(event.target.value)} disabled={type !== 'PERCENTAGE'} placeholder={t('promotion.noCap')} /></div>
          </section>

          {type !== 'FREE_SHIPPING' && <section className="space-y-3 border-t pt-5"><h3 className="text-sm font-semibold">{t('promotion.targets')}</h3><PromotionTargetSelector scope={scope} value={targets} onChange={setTargets} coupon={couponToEdit} /></section>}

          <section className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t('promotion.startsAt')}</Label><Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required /></div>
            <div className="space-y-2"><Label>{t('promotion.endsAt')}</Label><Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div>
            <div className="space-y-2"><Label>{t('promotion.minOrder')}</Label><Input type="number" min="0" step="0.001" value={minOrderInput} onChange={(event) => setMinOrderInput(event.target.value)} placeholder={t('promotion.none')} /></div>
            <div className="space-y-2"><Label>{t('promotion.globalLimit')}</Label><Input type="number" min="1" value={usageLimitInput} onChange={(event) => setUsageLimitInput(event.target.value)} placeholder={t('promotion.unlimited')} /></div>
            <div className="space-y-2"><Label>{t('promotion.perCustomer')}</Label><Input type="number" min="1" value={perCustomerInput} onChange={(event) => setPerCustomerInput(event.target.value)} placeholder={t('promotion.unlimited')} /></div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3"><div><Label>{t('promotion.combinable')}</Label><p className="text-xs text-muted-foreground">{t('promotion.combinableHelp')}</p></div><Switch checked={combinable} onCheckedChange={setCombinable} /></div>
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3"><div><Label>{t('promotion.active')}</Label><p className="text-xs text-muted-foreground">{t('promotion.activeHelp')}</p></div><Switch checked={isActive} onCheckedChange={setIsActive} /></div>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="text-sm font-semibold">{t('promotion.storefront')}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t('promotion.storefrontHelp')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <label className="group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/30">
                {imagePreview ? (
                  <Image src={imagePreview} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground"><ImagePlus className="size-6" />{t('promotion.chooseImage')}</span>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleImage(event.target.files?.[0])} />
              </label>
              <div className="grid content-start gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 sm:col-span-2"><div><Label>{t('promotion.showOnStorefront')}</Label><p className="text-xs text-muted-foreground">{t('promotion.showOnStorefrontHelp')}</p></div><Switch checked={showOnStorefront} onCheckedChange={setShowOnStorefront} /></div>
                <div className="space-y-2"><Label>{t('promotion.sortOrder')}</Label><Input type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></div>
                <div className="space-y-2"><Label>{t('promotion.ctaUrl')}</Label><Input value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} placeholder="/products" dir="ltr" /></div>
                <p className="text-xs text-muted-foreground sm:col-span-2">{t('promotion.imageHelp')}</p>
              </div>
            </div>
          </section>

          <DialogFooter className="sticky bottom-0 -mx-6 border-t bg-card px-6 py-4"><Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button><Button type="submit" disabled={mutation.isPending} className="bg-[#FF8C00] text-white hover:bg-[#e67e00]">{mutation.isPending && <Loader2 className="size-4 animate-spin" />}{isEditing ? t('promotion.update') : t('promotion.create')}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
