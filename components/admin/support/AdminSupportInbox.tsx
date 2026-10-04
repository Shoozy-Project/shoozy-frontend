'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, LockKeyhole, MessageCircle, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminSupportApi } from '@/lib/api/support';
import { getNotificationSocket } from '@/lib/notifications-socket';
import { useTranslations } from '@/lib/hooks/use-translations';
import type { SupportStatus } from '@/types/support';

export function AdminSupportInbox() {
  const { locale, t } = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SupportStatus | ''>('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const list = useQuery({
    queryKey: ['admin-support', 'list', page, status, unreadOnly, debouncedSearch],
    queryFn: () => adminSupportApi.list({ page, limit: 20, ...(status ? { status } : {}), ...(unreadOnly ? { unreadOnly: true } : {}), ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}) }),
    placeholderData: (previous) => previous,
  });
  const activeId = selectedId ?? list.data?.items[0]?.id ?? null;
  const detail = useQuery({
    queryKey: ['admin-support', 'conversation', activeId],
    queryFn: () => adminSupportApi.get(activeId!),
    enabled: !!activeId,
  });
  const messages = useQuery({
    queryKey: ['admin-support', 'messages', activeId],
    queryFn: () => adminSupportApi.messages(activeId!),
    enabled: !!activeId,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-support'] });
  const send = useMutation({
    mutationFn: () => adminSupportApi.send(activeId!, reply.trim()),
    onSuccess: () => { setReply(''); void refresh(); },
  });
  const changeStatus = useMutation({
    mutationFn: (next: SupportStatus) => adminSupportApi.status(activeId!, next),
    onSuccess: () => void refresh(),
  });

  useEffect(() => {
    if (!activeId) return;
    void adminSupportApi.read(activeId).then(() => void refresh()).catch(() => undefined);
  // Reading is scoped to the selected conversation; refresh is intentionally not a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const socket = getNotificationSocket();
    const invalidate = () => void refresh();
    const join = () => { if (activeId) socket.emit('support:join', activeId); };
    socket.on('connect', join);
    socket.on('support:conversation:new', invalidate);
    socket.on('support:message:new', invalidate);
    socket.on('support:conversation:updated', invalidate);
    socket.on('support:conversation:read', invalidate);
    socket.on('support:conversation:status', invalidate);
    join();
    return () => {
      socket.off('connect', join);
      socket.off('support:conversation:new', invalidate);
      socket.off('support:message:new', invalidate);
      socket.off('support:conversation:updated', invalidate);
      socket.off('support:conversation:read', invalidate);
      socket.off('support:conversation:status', invalidate);
    };
  // queryClient is stable and refresh intentionally invalidates the whole support namespace.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  if (list.isError && axios.isAxiosError(list.error) && list.error.response?.status === 403) {
    return <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center"><LockKeyhole className="mb-4 size-10 text-muted-foreground" /><h1 className="text-xl font-bold">{t('support.accessDenied')}</h1><p className="mt-2 max-w-md text-sm text-muted-foreground">{t('support.accessDeniedCopy')}</p></div>;
  }

  const current = detail.data;
  const date = (value: string) => new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'en-TN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  return (
    <div className="space-y-5">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><MessageCircle className="size-6 text-[#FF8C00]" />{t('support.adminTitle')}</h1><p className="mt-1 text-sm text-muted-foreground">{t('support.adminCopy')}</p></div>
      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[360px_1fr]">
        <aside className="flex min-h-0 flex-col border-e">
          <div className="space-y-3 border-b p-3">
            <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t('support.search')} className="w-full rounded-lg border bg-background py-2 pe-3 ps-9 text-sm" /></div>
            <div className="flex gap-2"><select value={status} onChange={(event) => { setStatus(event.target.value as SupportStatus | ''); setPage(1); }} className="min-w-0 flex-1 rounded-lg border bg-background px-2 py-2 text-xs"><option value="">{t('support.allStatuses')}</option><option value="OPEN">{t('support.status.OPEN')}</option><option value="PENDING">{t('support.status.PENDING')}</option><option value="CLOSED">{t('support.status.CLOSED')}</option></select><label className="flex items-center gap-2 rounded-lg border px-2 text-xs"><input type="checkbox" checked={unreadOnly} onChange={(event) => { setUnreadOnly(event.target.checked); setPage(1); }} />{t('support.unread')}</label></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.isPending ? <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-[#FF8C00]" /></div> : list.isError ? <p className="p-6 text-center text-sm text-red-600 dark:text-red-400">{t('support.loadError')}</p> : list.data?.items.length ? list.data.items.map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full border-b p-4 text-start transition hover:bg-orange-50/40 dark:hover:bg-orange-950/20 ${activeId === item.id ? 'bg-orange-50 dark:bg-orange-950/30' : ''}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{item.reference}</span>{item.adminUnreadCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-[#FF8C00] text-[10px] font-bold text-white">{item.adminUnreadCount}</span>}</div><p className="mt-1 truncate text-sm font-medium">{item.customer.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.lastMessagePreview ?? t('support.noMessages')}</p><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{t(`support.status.${item.status}`)}</span><time>{date(item.lastMessageAt)}</time></div></button>) : <p className="p-8 text-center text-sm text-muted-foreground">{t('support.empty')}</p>}
          </div>
          {(list.data?.pagination.totalPages ?? 0) > 1 && <div className="flex items-center justify-between border-t p-3 text-xs"><Button size="icon-sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4 rtl:rotate-180" /></Button><span>{t('account.pageOf', { page, total: list.data?.pagination.totalPages ?? 1 })}</span><Button size="icon-sm" variant="outline" disabled={page >= (list.data?.pagination.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4 rtl:rotate-180" /></Button></div>}
        </aside>

        {!activeId ? <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">{t('support.selectConversation')}</div> : detail.isPending || messages.isPending ? <div className="flex items-center justify-center"><Loader2 className="size-7 animate-spin text-[#FF8C00]" /></div> : detail.isError || messages.isError || !current ? <div className="flex items-center justify-center p-8 text-sm text-red-600 dark:text-red-400">{t('support.loadError')}</div> : <section className="flex min-h-0 flex-col">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b p-4"><div><h2 className="font-bold">{current.customer.name} <span className="ms-2 text-xs font-normal text-muted-foreground">{current.reference}</span></h2><p className="mt-1 text-xs text-muted-foreground" dir="ltr">{current.customer.phone}{current.customer.email ? ` · ${current.customer.email}` : ''}{current.customer.isGuest ? ` · ${t('support.guest')}` : ''}</p>{current.order && <p className="mt-1 text-xs text-muted-foreground">{t('support.order')}: <bdi>{current.order.orderNumber}</bdi></p>}</div><select value={current.status} disabled={changeStatus.isPending} onChange={(event) => changeStatus.mutate(event.target.value as SupportStatus)} className="rounded-lg border bg-background px-3 py-2 text-xs"><option value="OPEN">{t('support.status.OPEN')}</option><option value="PENDING" disabled={current.status === 'CLOSED'}>{t('support.status.PENDING')}</option><option value="CLOSED">{t('support.status.CLOSED')}</option></select></header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5">{messages.data?.items.map((message) => { const admin = message.senderType === 'ADMIN'; return <div key={message.id} className={`flex ${admin ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 ${admin ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950' : 'border bg-background'}`}><p className="text-[10px] font-bold opacity-60">{message.senderDisplayName}</p><p className="whitespace-pre-wrap break-words text-sm">{message.body}</p><time className="mt-1 block text-[9px] opacity-50">{date(message.createdAt)}</time></div></div>; })}</div>
          <form onSubmit={(event) => { event.preventDefault(); if (reply.trim()) send.mutate(); }} className="flex gap-2 border-t p-4"><textarea rows={2} maxLength={2000} value={reply} onChange={(event) => setReply(event.target.value)} disabled={current.status === 'CLOSED'} placeholder={current.status === 'CLOSED' ? t('support.reopenToReply') : t('support.reply')} className="min-h-11 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm disabled:bg-muted" /><Button type="submit" disabled={!reply.trim() || send.isPending || current.status === 'CLOSED'} className="self-end bg-[#FF8C00] text-white hover:bg-[#e67e00]">{send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{t('support.send')}</Button></form>
        </section>}
      </div>
    </div>
  );
}
