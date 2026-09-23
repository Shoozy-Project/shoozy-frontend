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

export function ProfileForm() {
  const client = useQueryClient();
  const profile = useQuery({ queryKey: commerceKeys.profile, queryFn: accountApi.profile });
  const save = useMutation({
    mutationFn: (value: { firstName: string; lastName: string; phone: string | null }) => accountApi.updateProfile(value),
    onSuccess: (value) => { client.setQueryData(commerceKeys.profile, value); toast.success('Profile updated.'); },
    onError: (error) => toast.error(commerceErrorMessage(error, 'Profile could not be updated.')),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save.mutate({ firstName: String(data.get('firstName') ?? '').trim(), lastName: String(data.get('lastName') ?? '').trim(), phone: String(data.get('phone') ?? '').trim() || null });
  };
  if (profile.isLoading) return <p className="py-16 text-center text-muted-foreground">Loading profile…</p>;
  if (profile.isError || !profile.data) return <p className="rounded-xl border p-8 text-center">Profile could not be loaded.</p>;
  return (
    <div className="max-w-2xl"><h2 className="font-serif text-3xl">Profile</h2><p className="mt-2 text-sm text-muted-foreground">Only customer-editable details are shown.</p>
      <form key={profile.data.updatedAt} onSubmit={submit} className="mt-8 space-y-5 rounded-xl border p-5 sm:p-6">
        <div className="space-y-2"><Label>Email</Label><Input value={profile.data.email} disabled className="h-10" /><p className="text-xs text-muted-foreground">Email changes are not supported by the account API.</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field id="profile-first" name="firstName" label="First name" defaultValue={profile.data.firstName} max={100} /><Field id="profile-last" name="lastName" label="Last name" defaultValue={profile.data.lastName} max={100} /></div>
        <Field id="profile-phone" name="phone" label="Phone" defaultValue={profile.data.phone ?? ''} max={32} required={false} />
        <Button type="submit" className="h-10" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </div>
  );
}

function Field({ id, name, label, defaultValue, max, required = true }: { id: string; name: string; label: string; defaultValue: string; max: number; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={name} defaultValue={defaultValue} maxLength={max} required={required} className="h-10" /></div>; }
