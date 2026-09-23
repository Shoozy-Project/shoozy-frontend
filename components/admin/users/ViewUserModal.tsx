'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Calendar, Loader2, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { adminCustomersApi } from '@/lib/api/users';
import type { CustomerDto } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/hooks/use-translations';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; user: CustomerDto | null }

export default function ViewUserModal({ open, onOpenChange, user }: Props) {
  const { locale, t } = useTranslations();
  const query = useQuery({
    queryKey: ['customer', user?.id],
    queryFn: () => adminCustomersApi.getById(user!.id).then((response) => response.data.data),
    enabled: open && !!user,
  });
  const customer = query.data;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#FF8C00]/10 via-amber-50 to-orange-50 px-6 py-6 border-b">
          <DialogHeader><DialogTitle>{user?.firstName} {user?.lastName}</DialogTitle><p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p></DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-4">
          {query.isPending && <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF8C00]" /></div>}
          {query.isError && <p className="py-8 text-sm text-center text-red-600">{t('admin.customerDetailsLoadError')}</p>}
          {customer && <>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Info icon={<Activity />} label={t('admin.tableStatus')}><Badge className={customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>{t(`status.${customer.status}`)}</Badge></Info>
              <Info icon={<Phone />} label={t('admin.tablePhone')}>{customer.phone ?? t('admin.notProvided')}</Info>
              <Info icon={<ShoppingBag />} label={t('admin.totalOrders')}>{customer.summary.totalOrders.toLocaleString(locale)}</Info>
              <Info icon={<Calendar />} label={t('admin.memberSince')}>{new Date(customer.createdAt).toLocaleDateString(locale)}</Info>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('admin.addresses')}</h3>
              {customer.addresses.length === 0 ? <p className="text-xs text-gray-400">{t('admin.noSavedAddresses')}</p> : customer.addresses.map((address) => <div key={address.id} className="p-3 rounded-lg bg-gray-50 border text-xs mb-2"><p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-[#FF8C00]" />{address.recipientName}{address.isDefault ? ` · ${t('admin.default')}` : ''}</p><p className="text-gray-600 mt-1">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}</p></div>)}
            </div>
          </>}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end"><Button variant="outline" onClick={() => onOpenChange(false)}>{t('admin.close')}</Button></div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ icon, label, children }: { icon: React.ReactElement; label: string; children: React.ReactNode }) {
  return <div className="p-3 rounded-lg bg-gray-50 border space-y-1"><span className="text-gray-400 flex items-center gap-1 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:text-[#FF8C00]">{icon}{label}</span><div className="font-semibold text-black">{children}</div></div>;
}
