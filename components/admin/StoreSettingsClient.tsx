'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { storeSettingsApi } from '@/lib/api/store-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/hooks/use-translations';

const createSettingsSchema = (t: (key: string) => string) => z.object({
  storeName: z.string().trim().min(1).max(150),
  whatsappNumber: z.union([z.literal(''), z.string().regex(/^\+216[2-9]\d{7}$/, t('admin.validationWhatsapp'))]),
  supportPhone: z.string().max(32),
  supportEmail: z.union([z.literal(''), z.string().email().max(320)]),
  shippingPolicy: z.string().max(10_000),
  returnWindowDays: z.string().regex(/^\d+$/, t('admin.validationWholeDays')).refine((value) => Number(value) <= 365, t('admin.validationMaxDays')),
  exchangeWindowDays: z.string().regex(/^\d+$/, t('admin.validationWholeDays')).refine((value) => Number(value) <= 365, t('admin.validationMaxDays')),
  whatsappConfirmationEnabled: z.boolean(),
});
type SettingsForm = z.infer<ReturnType<typeof createSettingsSchema>>;
const inputClassName = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900 outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/10 disabled:bg-gray-50 disabled:text-gray-500';

export default function StoreSettingsClient() {
  const { t } = useTranslations();
  const settingsSchema = useMemo(() => createSettingsSchema(t), [t]);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['store-settings'], queryFn: () => storeSettingsApi.get().then((response) => response.data.data) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { storeName: '', whatsappNumber: '', supportPhone: '', supportEmail: '', shippingPolicy: '', returnWindowDays: '14', exchangeWindowDays: '14', whatsappConfirmationEnabled: false },
  });
  useEffect(() => {
    if (!query.data) return;
    reset({
      storeName: query.data.storeName,
      whatsappNumber: query.data.whatsappNumber ?? '',
      supportPhone: query.data.supportPhone ?? '',
      supportEmail: query.data.supportEmail ?? '',
      shippingPolicy: query.data.shippingPolicy ?? '',
      returnWindowDays: String(query.data.returnWindowDays),
      exchangeWindowDays: String(query.data.exchangeWindowDays),
      whatsappConfirmationEnabled: query.data.whatsappConfirmationEnabled,
    });
  }, [query.data, reset]);
  const mutation = useMutation({
    mutationFn: (values: SettingsForm) => storeSettingsApi.update({
      storeName: values.storeName.trim(),
      whatsappNumber: values.whatsappNumber || null,
      supportPhone: values.supportPhone.trim() || null,
      supportEmail: values.supportEmail.trim() || null,
      shippingPolicy: values.shippingPolicy.trim() || null,
      returnWindowDays: Number(values.returnWindowDays),
      exchangeWindowDays: Number(values.exchangeWindowDays),
      whatsappConfirmationEnabled: values.whatsappConfirmationEnabled,
    }),
    onSuccess: (response) => {
      queryClient.setQueryData(['store-settings'], response.data.data);
      toast.success(t('admin.settingsSaved'));
    },
    onError: () => toast.error(t('admin.settingsSaveError')),
  });
  if (query.isPending) return <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#FF8C00]" /></div>;
  if (query.isError) return <div className="p-8 border rounded-lg bg-white text-sm text-red-600">{t('admin.settingsLoadError')} <Button variant="outline" size="sm" className="ms-3" onClick={() => query.refetch()}>{t('common.retry')}</Button></div>;

  return <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-6 max-w-4xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-[#FF8C00]" />{t('admin.storeSettings')}</h1><p className="text-sm text-gray-500 mt-1">{t('admin.storeSettingsCopy')}</p></div><Button type="submit" disabled={mutation.isPending} className="bg-[#FF8C00] hover:bg-[#e67e00] text-white">{mutation.isPending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}{t('admin.saveChanges')}</Button></div>
    <Card><CardHeader><CardTitle>{t('admin.generalStoreDetails')}</CardTitle><CardDescription>{t('admin.generalStoreDetailsCopy')}</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={t('admin.storeName')} error={errors.storeName?.message}><input {...register('storeName')} className={inputClassName} /></Field>
      <Field label={t('admin.supportEmail')} error={errors.supportEmail?.message}><input type="email" {...register('supportEmail')} className={inputClassName} /></Field>
      <Field label={t('admin.supportPhone')} error={errors.supportPhone?.message}><input {...register('supportPhone')} className={inputClassName} /></Field>
      <Field label={t('admin.whatsappNumber')} error={errors.whatsappNumber?.message}><input placeholder="+21620123456" {...register('whatsappNumber')} className={inputClassName} /></Field>
      <Field label={t('admin.country')}><input value={query.data.countryCode} readOnly disabled className={inputClassName} /></Field>
      <Field label={t('admin.currency')}><input value={`${query.data.currency} (${t('admin.minorDigits', { count: query.data.currencyMinorUnit })})`} readOnly disabled className={inputClassName} /></Field>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>{t('admin.returnsConfirmation')}</CardTitle><CardDescription>{t('admin.returnsConfirmationCopy')}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Field label={t('admin.returnWindow')} error={errors.returnWindowDays?.message}><input type="number" min="0" max="365" {...register('returnWindowDays')} className={inputClassName} /></Field><Field label={t('admin.exchangeWindow')} error={errors.exchangeWindowDays?.message}><input type="number" min="0" max="365" {...register('exchangeWindowDays')} className={inputClassName} /></Field></div><Field label={t('admin.shippingPolicy')} error={errors.shippingPolicy?.message}><textarea rows={6} {...register('shippingPolicy')} className={`${inputClassName} resize-y`} /></Field><label className="flex items-center gap-3 text-sm"><input type="checkbox" {...register('whatsappConfirmationEnabled')} className="w-4 h-4 accent-[#FF8C00]" />{t('admin.enableWhatsapp')}</label></CardContent></Card>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}{children}{error && <span className="block normal-case tracking-normal text-red-500">{error}</span>}</label>;
}
