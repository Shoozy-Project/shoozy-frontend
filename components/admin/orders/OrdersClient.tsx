'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Clock, Eye, FilterX, Package, Search, ShoppingCart } from 'lucide-react';
import { ordersApi, type OrderAction, type OrderActionPayload, type OrderStatus } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import OrderDetailsModal from './OrderDetailsModal';
import { formatMinorMoney } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

const statuses: Array<{ id: OrderStatus | 'ALL'; labelKey: string }> = [
  { id: 'ALL', labelKey: 'admin.allOrders' }, { id: 'PENDING', labelKey: 'status.PENDING' },
  { id: 'CONFIRMED', labelKey: 'status.CONFIRMED' }, { id: 'SHIPPED', labelKey: 'status.SHIPPED' },
  { id: 'DELIVERED', labelKey: 'status.DELIVERED' }, { id: 'RETURNED', labelKey: 'status.RETURNED' },
  { id: 'CANCELLED', labelKey: 'status.CANCELLED' },
];

export default function OrdersClient() {
  const { locale, t } = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('notificationOrder');
    if (!requested || !/^[0-9a-f-]{36}$/i.test(requested)) return;
    const timer = window.setTimeout(() => setActiveOrderId(requested), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const params = { page, limit, search: debouncedSearch.trim() || undefined, status: status === 'ALL' ? undefined : status };
  const listQuery = useQuery({ queryKey: ['orders', params], queryFn: () => ordersApi.list(params), placeholderData: (previous) => previous });
  const detailQuery = useQuery({ queryKey: ['order', activeOrderId], queryFn: () => ordersApi.getById(activeOrderId!), enabled: !!activeOrderId });
  const transition = useMutation({
    mutationFn: ({ action, payload }: { action: OrderAction; payload?: OrderActionPayload }) => ordersApi.transition(activeOrderId!, action, payload),
    onSuccess: ({ order }) => {
      queryClient.setQueryData(['order', order.id], order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('admin.orderTransitionSuccess', { number: order.orderNumber, status: t(`status.${order.status}`) }));
    },
    onError: () => toast.error(t('admin.orderActionError')),
  });
  const orders = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;

  return <div className="space-y-6 animate-fade-in">
    <div><h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2.5"><ShoppingCart className="w-7 h-7 text-[#FF8C00]" /> {t('admin.codOrders')}</h1><p className="text-sm text-gray-500 mt-1">{t('admin.ordersCopy')}</p></div>
    <div className="flex items-center gap-2 overflow-x-auto pb-2">{statuses.map((item) => <button key={item.id} onClick={() => { setStatus(item.id); setPage(1); }} className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap ${status === item.id ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{t(item.labelKey)}</button>)}</div>
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gray-50/40"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><CardTitle className="text-base">{t('admin.orderDirectory')}</CardTitle><CardDescription>{pagination ? t('admin.orderCount', { count: pagination.total }) : t('admin.orders')}</CardDescription></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t('admin.searchOrderCustomer')} className="w-72 ps-9 pe-4 py-2 border rounded-xl text-xs" /></div>{search && <Button variant="ghost" size="sm" onClick={() => setSearch('')}><FilterX className="w-4 h-4" /></Button>}</div></div></CardHeader>
      <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{t('admin.tableOrder')}</TableHead><TableHead>{t('admin.tableItems')}</TableHead><TableHead>{t('admin.tableTotal')}</TableHead><TableHead>{t('admin.tablePayment')}</TableHead><TableHead>{t('admin.tableStatus')}</TableHead><TableHead>{t('admin.tablePlaced')}</TableHead><TableHead className="text-end">{t('admin.tableActions')}</TableHead></TableRow></TableHeader><TableBody>
        {listQuery.isPending && Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={7}><div className="h-9 rounded bg-gray-100 animate-pulse" /></TableCell></TableRow>)}
        {listQuery.isError && <TableRow><TableCell colSpan={7} className="py-12 text-center"><p className="text-sm text-red-600 mb-2">{t('admin.ordersLoadError')}</p><Button variant="outline" size="sm" onClick={() => listQuery.refetch()}>{t('common.retry')}</Button></TableCell></TableRow>}
        {!listQuery.isPending && !listQuery.isError && orders.length === 0 && <TableRow><TableCell colSpan={7} className="py-14 text-center"><Package className="w-9 h-9 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">{t('admin.noOrders')}</p></TableCell></TableRow>}
        {orders.map((order) => <TableRow key={order.id}><TableCell className="font-mono text-xs font-bold text-[#FF8C00]">{order.orderNumber}</TableCell><TableCell className="text-xs">{order.itemCount}</TableCell><TableCell className="text-xs font-bold">{formatMinorMoney(order.totals.totalMinor, order.totals.currency, undefined, locale)}</TableCell><TableCell><PaymentStatusBadge paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} /></TableCell><TableCell><OrderStatusBadge status={order.status} /></TableCell><TableCell className="text-xs text-gray-500"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.placedAt || order.createdAt).toLocaleDateString(locale)}</span></TableCell><TableCell className="text-end"><Button variant="outline" size="sm" onClick={() => setActiveOrderId(order.id)}><Eye className="w-3.5 h-3.5 me-1" />{t('admin.details')}</Button></TableCell></TableRow>)}
      </TableBody></Table></div>{pagination && <DataTablePagination currentPage={pagination.page} pageSize={pagination.limit} totalItems={pagination.total} totalPages={pagination.totalPages} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} itemLabel={t('admin.orders')} />}</CardContent>
    </Card>
    <OrderDetailsModal order={detailQuery.data ?? null} loading={detailQuery.isPending && !!activeOrderId} error={detailQuery.isError} isOpen={!!activeOrderId} onClose={() => setActiveOrderId(null)} onAction={(action, payload) => transition.mutateAsync({ action, payload }).then(() => undefined)} actionPending={transition.isPending} />
  </div>;
}
