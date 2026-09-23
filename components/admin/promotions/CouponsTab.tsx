'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Archive, BarChart3, Check, Copy, Edit, Loader2, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMinorMoney } from '@/lib/format-money';
import { promotionsApi, type CouponDto, type DiscountStatus } from '@/lib/api/promotions';
import { useTranslations } from '@/lib/hooks/use-translations';

const CouponFormModal = dynamic(() => import('./CouponFormModal'), { ssr: false });
const DeleteCouponDialog = dynamic(() => import('./DeleteCouponDialog'), { ssr: false });

const statusStyle: Record<DiscountStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  DISABLED: 'bg-gray-100 text-gray-700 border-gray-200',
  ARCHIVED: 'bg-amber-50 text-amber-700 border-amber-200',
};

function promotionValue(promotion: CouponDto, freeShipping: string, locale: string) {
  if (promotion.type === 'FREE_SHIPPING') return freeShipping;
  if (promotion.type === 'FIXED_AMOUNT') return formatMinorMoney(promotion.value, promotion.currency ?? 'TND', 3, locale);
  return `${(Number(promotion.value) / 100).toFixed(2)}%`;
}

export default function CouponsTab() {
  const queryClient = useQueryClient();
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState<CouponDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponDto | null>(null);
  const [detailTarget, setDetailTarget] = useState<CouponDto | null>(null);

  const list = useQuery({
    queryKey: ['admin-promotions', page, limit, debouncedSearch],
    queryFn: () => promotionsApi.listCoupons({ page, limit, search: debouncedSearch.trim() || undefined }).then((response) => response.data.data),
    placeholderData: (previous) => previous,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => promotionsApi.toggleCouponActive(id, active),
    onSuccess: () => { toast.success(t('promotion.statusUpdated')); void refresh(); },
    onError: () => toast.error(t('promotion.statusError')),
  });
  const archive = useMutation({
    mutationFn: promotionsApi.archive,
    onSuccess: () => { toast.success(t('promotion.archived')); void refresh(); },
    onError: () => toast.error(t('promotion.archiveError')),
  });

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t('promotion.codeCopied'));
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="size-5 text-[#FF8C00]" />{t('promotion.title')}</h2><p className="mt-1 text-xs text-muted-foreground">{t('promotion.copy')}</p></div>
        <Button onClick={() => { setPromotionToEdit(null); setModalOpen(true); }} className="bg-[#FF8C00] text-white hover:bg-[#e67e00]"><Plus className="size-4" />{t('promotion.add')}</Button>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>{t('promotion.directory')}</CardTitle><CardDescription>{list.data ? t('promotion.count', { count: list.data.pagination.total }) : t('promotion.loading')}</CardDescription></div>
          <div className="relative w-full sm:w-72"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t('promotion.search')} className="w-full rounded-xl border py-2 pe-3 ps-9 text-sm" /></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{t('promotion.promotion')}</TableHead><TableHead>{t('promotion.mode')}</TableHead><TableHead>{t('promotion.value')}</TableHead><TableHead>{t('promotion.scope')}</TableHead><TableHead>{t('promotion.priority')}</TableHead><TableHead>{t('promotion.usage')}</TableHead><TableHead>{t('promotion.status')}</TableHead><TableHead>{t('promotion.enabled')}</TableHead><TableHead className="text-end">{t('promotion.actions')}</TableHead></TableRow></TableHeader><TableBody>
            {list.isPending && <TableRow><TableCell colSpan={9} className="py-14 text-center"><Loader2 className="mx-auto size-6 animate-spin text-[#FF8C00]" /></TableCell></TableRow>}
            {list.isError && <TableRow><TableCell colSpan={9} className="py-14 text-center"><p className="text-sm text-destructive">{t('promotion.loadError')}</p><Button variant="outline" className="mt-3" onClick={() => list.refetch()}>{t('common.retry')}</Button></TableCell></TableRow>}
            {!list.isPending && !list.isError && list.data?.items.length === 0 && <TableRow><TableCell colSpan={9} className="py-14 text-center text-sm text-muted-foreground">{t('promotion.empty')}</TableCell></TableRow>}
            {list.data?.items.map((promotion) => <TableRow key={promotion.id}>
              <TableCell><p className="font-semibold">{promotion.name}</p><p className="mt-1 max-w-52 truncate text-xs text-muted-foreground">{promotion.description || promotion.id}</p></TableCell>
              <TableCell>{promotion.code ? <button type="button" onClick={() => void copy(promotion.code!)} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 font-mono text-xs">{promotion.code}{copiedCode === promotion.code ? <Check className="size-3" /> : <Copy className="size-3" />}</button> : <Badge variant="outline">{t('promotion.automatic')}</Badge>}</TableCell>
              <TableCell className="font-semibold text-green-700 dark:text-green-400">{promotionValue(promotion, t('promotion.freeShipping'), intlLocale)}</TableCell>
              <TableCell className="text-xs">{promotion.scope}{promotion.targets.length ? ` · ${promotion.targets.length}` : ''}</TableCell>
              <TableCell className="text-xs">{promotion.priority}</TableCell>
              <TableCell className="text-xs">{promotion.redemptionCount}{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}</TableCell>
              <TableCell><Badge className={statusStyle[promotion.status]}>{t(`status.${promotion.status}`)}</Badge></TableCell>
              <TableCell><Switch checked={promotion.isActive} disabled={promotion.status === 'ARCHIVED' || toggle.isPending} onCheckedChange={(active) => toggle.mutate({ id: promotion.id, active })} /></TableCell>
              <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => setDetailTarget(promotion)} aria-label={t('promotion.statistics')}><BarChart3 className="size-4" /></Button><Button size="icon" variant="ghost" disabled={promotion.status === 'ARCHIVED'} onClick={() => { setPromotionToEdit(promotion); setModalOpen(true); }} aria-label={t('common.edit')}><Edit className="size-4" /></Button><Button size="icon" variant="ghost" disabled={promotion.status === 'ARCHIVED' || archive.isPending} onClick={() => { if (window.confirm(t('promotion.archiveConfirm', { name: promotion.name }))) archive.mutate(promotion.id); }} aria-label={t('promotion.archive')}><Archive className="size-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(promotion)} aria-label={t('promotion.delete')}><Trash2 className="size-4" /></Button></div></TableCell>
            </TableRow>)}
          </TableBody></Table></div>
          {list.data?.pagination && <DataTablePagination currentPage={list.data.pagination.page} pageSize={list.data.pagination.limit} totalItems={list.data.pagination.total} totalPages={list.data.pagination.totalPages} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} itemLabel={t('promotion.itemLabel')} />}
        </CardContent>
      </Card>

      {modalOpen && <CouponFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setPromotionToEdit(null); }} couponToEdit={promotionToEdit} />}
      {!!deleteTarget && <DeleteCouponDialog isOpen onClose={() => setDeleteTarget(null)} coupon={deleteTarget} />}
      {!!detailTarget && <PromotionStatisticsDialog promotion={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}

function PromotionStatisticsDialog({ promotion, onClose }: { promotion: CouponDto; onClose: () => void }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const statistics = useQuery({ queryKey: ['admin-promotions', promotion.id, 'statistics'], queryFn: () => promotionsApi.statistics(promotion.id) });
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{promotion.name}</DialogTitle><DialogDescription>{t(`status.${promotion.status}`)} · {promotion.activationMode === 'AUTOMATIC' ? t('promotion.automatic') : t('promotion.couponCodeMode')} · {promotion.scope}</DialogDescription></DialogHeader>{statistics.isPending ? <div className="flex justify-center p-10"><Loader2 className="size-6 animate-spin" /></div> : statistics.isError ? <p className="p-6 text-center text-sm text-destructive">{t('promotion.statsError')}</p> : statistics.data && <dl className="grid grid-cols-2 gap-4"><Stat label={t('promotion.usageCount')} value={String(statistics.data.usageCount)} /><Stat label={t('promotion.associatedOrders')} value={String(statistics.data.associatedOrders)} /><Stat label={t('promotion.discountGranted')} value={formatMinorMoney(statistics.data.totalDiscountGrantedMinor, 'TND', 3, intlLocale)} /><Stat label={t('promotion.paidRevenue')} value={formatMinorMoney(statistics.data.revenueMinor, 'TND', 3, intlLocale)} /></dl>}</DialogContent></Dialog>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/30 p-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 text-xl font-semibold">{value}</dd></div>;
}
