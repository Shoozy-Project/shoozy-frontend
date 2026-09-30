'use client';

import { useState } from 'react';
import { Archive, BarChart3, Check, Copy, Edit, Loader2, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMinorMoney } from '@/lib/format-money';
import type { CouponDto, DiscountStatus } from '@/lib/api/promotions';

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

interface CouponsListTabProps {
  items: CouponDto[];
  listData: any;
  search: string;
  setSearch: (val: string) => void;
  setPage: (val: number) => void;
  toggle: any;
  archive: any;
  setPromotionToEdit: (val: CouponDto | null) => void;
  setModalOpen: (val: boolean) => void;
  setDetailTarget: (val: CouponDto | null) => void;
  setDeleteTarget: (val: CouponDto | null) => void;
  locale: string;
  t: (key: string, args?: any) => string;
}

export default function CouponsListTab({
  items,
  listData,
  search,
  setSearch,
  setPage,
  toggle,
  archive,
  setPromotionToEdit,
  setModalOpen,
  setDetailTarget,
  setDeleteTarget,
  locale,
  t
}: CouponsListTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t('promotion.codeCopied'));
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <Card className="overflow-hidden shadow-sm border-gray-100">
      <CardHeader className="flex flex-col gap-4 border-b border-gray-100 bg-white sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <CardTitle className="text-lg text-gray-900">{t('promotion.directory')}</CardTitle>
          <CardDescription className="text-xs text-gray-500 mt-1">
            {listData.data ? t('promotion.count', { count: items.length }) : t('promotion.loading')}
          </CardDescription>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={(event) => { setSearch(event.target.value); setPage(1); }} 
            placeholder={t('promotion.search')} 
            className="w-full rounded-xl border border-gray-200 py-2.5 pe-3 ps-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all bg-gray-50 hover:bg-gray-100/50" 
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.promotion')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.mode')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.value')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.scope')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.priority')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.usage')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.status')}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500">{t('promotion.enabled')}</TableHead>
                <TableHead className="text-end text-xs font-semibold text-gray-500">{t('promotion.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listData.isPending && (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-[#FF8C00] mb-3" />
                    <p className="text-sm text-gray-500">Loading discounts...</p>
                  </TableCell>
                </TableRow>
              )}
              {listData.isError && (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center">
                    <p className="text-sm text-red-500 font-medium">{t('promotion.loadError')}</p>
                    <Button variant="outline" className="mt-4" onClick={() => listData.refetch()}>{t('common.retry')}</Button>
                  </TableCell>
                </TableRow>
              )}
              {!listData.isPending && !listData.isError && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center text-sm text-gray-400 font-medium">
                    {t('promotion.empty')}
                  </TableCell>
                </TableRow>
              )}
              {items.map((promotion) => (
                <TableRow key={promotion.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <p className="font-semibold text-gray-900">{promotion.name}</p>
                    <p className="mt-1 max-w-52 truncate text-xs text-gray-500">{promotion.description || promotion.id}</p>
                  </TableCell>
                  <TableCell>
                    {promotion.code ? (
                      <button type="button" onClick={() => void copy(promotion.code!)} className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors px-2.5 py-1 font-mono text-xs font-medium text-gray-700">
                        {promotion.code}
                        {copiedCode === promotion.code ? <Check className="size-3 text-green-600" /> : <Copy className="size-3 text-gray-400" />}
                      </button>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-200 font-medium">{t('promotion.automatic')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-[#FF8C00]">
                    {promotionValue(promotion, t('promotion.freeShipping'), intlLocale)}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-600">
                    {promotion.scope}{promotion.targets.length ? ` · ${promotion.targets.length}` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-600">{promotion.priority}</TableCell>
                  <TableCell className="text-xs font-medium text-gray-600">
                    {promotion.redemptionCount}{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusStyle[promotion.status]} text-[10px] font-bold px-2 py-0.5`}>
                      {t(`status.${promotion.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={promotion.isActive} 
                      disabled={promotion.status === 'ARCHIVED' || toggle.isPending} 
                      onCheckedChange={(active) => toggle.mutate({ id: promotion.id, active })}
                      className="data-[state=checked]:bg-[#FF8C00]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100" onClick={() => setDetailTarget(promotion)} aria-label={t('promotion.statistics')}>
                        <BarChart3 className="size-4 text-gray-500" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50" disabled={promotion.status === 'ARCHIVED'} onClick={() => { setPromotionToEdit(promotion); setModalOpen(true); }} aria-label={t('common.edit')}>
                        <Edit className="size-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-amber-50" disabled={promotion.status === 'ARCHIVED' || archive.isPending} onClick={() => { if (window.confirm(t('promotion.archiveConfirm', { name: promotion.name }))) archive.mutate(promotion.id); }} aria-label={t('promotion.archive')}>
                        <Archive className="size-4 text-amber-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 text-red-500" onClick={() => setDeleteTarget(promotion)} aria-label={t('promotion.delete')}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
