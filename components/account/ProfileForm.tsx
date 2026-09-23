'use client';

import { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api/account';
import { commerceErrorMessage } from '@/lib/api/errors';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ProfileForm() {
  const client = useQueryClient();
  const profile = useQuery({ queryKey: commerceKeys.profile, queryFn: accountApi.profile });
  const { t } = useTranslations();
  const save = useMutation({
    mutationFn: (value: { firstName: string; lastName: string; phone: string | null }) => accountApi.updateProfile(value),
    onSuccess: (value) => { client.setQueryData(commerceKeys.profile, value); toast.success(t('account.profileUpdated')); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('account.profileUpdateError'))),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save.mutate({ firstName: String(data.get('firstName') ?? '').trim(), lastName: String(data.get('lastName') ?? '').trim(), phone: String(data.get('phone') ?? '').trim() || null });
  };
  if (profile.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('account.loadingProfile')}</p>;
  if (profile.isError || !profile.data) return <p className="rounded-xl border p-8 text-center">{t('account.profileLoadError')}</p>;
  return (
    <div className="max-w-2xl"><h2 className="font-serif text-3xl">{t('account.profile')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.profileCopy')}</p>
      <form key={profile.data.updatedAt} onSubmit={submit} className="mt-8 space-y-5 rounded-xl border p-5 sm:p-6">
        <div className="space-y-2"><Label>{t('auth.email')}</Label><Input value={profile.data.email} disabled className="h-10" /><p className="text-xs text-muted-foreground">{t('account.emailChangeUnsupported')}</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field id="profile-first" name="firstName" label={t('auth.firstName')} defaultValue={profile.data.firstName} max={100} /><Field id="profile-last" name="lastName" label={t('auth.lastName')} defaultValue={profile.data.lastName} max={100} /></div>
        <Field id="profile-phone" name="phone" label={t('auth.phone')} defaultValue={profile.data.phone ?? ''} max={32} required={false} />
        <Button type="submit" className="h-10" disabled={save.isPending}>{save.isPending ? t('account.saving') : t('account.saveProfile')}</Button>
      </form>
    </div>
  );
}

function Field({ id, name, label, defaultValue, max, required = true }: { id: string; name: string; label: string; defaultValue: string; max: number; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={name} defaultValue={defaultValue} maxLength={max} required={required} className="h-10" /></div>; }
