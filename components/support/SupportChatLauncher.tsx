'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Headphones, Loader2, MessageCircle, Plus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supportApi } from '@/lib/api/support';
import { getNotificationSocket } from '@/lib/notifications-socket';
import { useTranslations } from '@/lib/hooks/use-translations';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import type { CreateSupportInput } from '@/types/support';

const GUEST_SESSION_KEY = 'shoozy-support-session';
interface GuestSession { conversationId: string; supportToken: string }

export function SupportChatLauncher() {
  const { locale, t } = useTranslations();
  const authenticated = useAuthStore(selectIsAuthenticated);
  const authReady = useAuthStore((state) => state.isInitialized);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', orderNumber: '', message: '' });

  /* eslint-disable react-hooks/set-state-in-effect -- sessionStorage is available only after hydration. */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<GuestSession>;
      if (typeof parsed.conversationId === 'string' && typeof parsed.supportToken === 'string') {
        setGuestSession({ conversationId: parsed.conversationId, supportToken: parsed.supportToken });
      }
    } catch {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const own = useQuery({
    queryKey: ['support', 'own'],
    queryFn: () => supportApi.listOwn(),
    enabled: authReady && authenticated && open,
  });
  const activeId = authenticated ? (selectedId ?? own.data?.items[0]?.id ?? null) : guestSession?.conversationId ?? null;
  const guestToken = authenticated ? null : guestSession?.supportToken ?? null;
  const conversation = useQuery({
    queryKey: ['support', 'conversation', activeId],
    queryFn: () => supportApi.get(activeId!, guestToken),
    enabled: open && !!activeId,
  });
  const messages = useQuery({
    queryKey: ['support', 'messages', activeId],
    queryFn: () => supportApi.messages(activeId!, guestToken),
    enabled: open && !!activeId,
  });

  const createConversation = useMutation({
    mutationFn: (input: CreateSupportInput) => supportApi.create(input),
    onSuccess: (created) => {
      if (created.supportAccessToken) {
        const session = { conversationId: created.id, supportToken: created.supportAccessToken };
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
        setGuestSession(session);
      } else {
        setSelectedId(created.id);
        void queryClient.invalidateQueries({ queryKey: ['support', 'own'] });
      }
      queryClient.setQueryData(['support', 'conversation', created.id], created);
      queryClient.setQueryData(['support', 'messages', created.id], {
        items: [created.initialMessage],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      setForm({ name: '', phone: '', email: '', orderNumber: '', message: '' });
      setShowNew(false);
    },
  });
  const sendMessage = useMutation({
    mutationFn: (message: string) => supportApi.send(activeId!, message, guestToken),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['support', 'messages', activeId] });
      void queryClient.invalidateQueries({ queryKey: ['support', 'conversation', activeId] });
      void queryClient.invalidateQueries({ queryKey: ['support', 'own'] });
    },
  });

  useEffect(() => {
    if (!open || !activeId) return;
    void supportApi.read(activeId, guestToken).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['support', 'own'] });
    }).catch(() => undefined);
  }, [activeId, guestToken, open, queryClient]);

  useEffect(() => {
    if (!activeId) return;
    const socket = getNotificationSocket();
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['support'] });
    };
    const join = () => {
      if (authenticated) socket.emit('support:join', activeId);
    };
    socket.on('connect', join);
    socket.on('support:message:new', refresh);
    socket.on('support:conversation:updated', refresh);
    socket.on('support:conversation:read', refresh);
    socket.on('support:conversation:status', refresh);
    if (!authenticated && guestToken) {
      socket.auth = { supportToken: guestToken, conversationId: activeId };
      if (!socket.connected) socket.connect();
    } else {
      join();
    }
    return () => {
      socket.off('connect', join);
      socket.off('support:message:new', refresh);
      socket.off('support:conversation:updated', refresh);
      socket.off('support:conversation:read', refresh);
      socket.off('support:conversation:status', refresh);
      if (!authenticated) socket.disconnect();
    };
  }, [activeId, authenticated, guestToken, queryClient]);

  const newFormVisible = showNew || (!activeId && (!authenticated || !own.isPending));
  const canCreate = useMemo(() => {
    const contactOk = authenticated || (!!form.name.trim() && !!form.phone.trim());
    return contactOk && !!form.message.trim();
  }, [authenticated, form.message, form.name, form.phone]);
  const closed = conversation.data?.status === 'CLOSED';
  const ownPending = authenticated && own.isPending;
  const ownError = authenticated && own.isError;

  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreate) return;
    createConversation.mutate({
      ...(!authenticated ? { name: form.name.trim(), phone: form.phone.trim(), ...(form.email.trim() ? { email: form.email.trim() } : {}) } : form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.orderNumber.trim() ? { orderNumber: form.orderNumber.trim().toUpperCase() } : {}),
      message: form.message.trim(),
    });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={t('support.open')} className="fixed bottom-24 end-5 z-[70] flex size-14 items-center justify-center rounded-full bg-[#FF8C00] text-white shadow-xl transition hover:scale-105 hover:bg-[#e67e00] md:bottom-5">
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
      {open && (
        <section dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed bottom-40 end-4 z-[70] flex h-[min(650px,calc(100vh-12rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl md:bottom-22 md:h-[min(650px,calc(100vh-7rem))]">
          <header className="flex items-center justify-between bg-neutral-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2"><Headphones className="size-5 text-[#FF8C00]" /><div><h2 className="text-sm font-semibold">{t('support.title')}</h2><p className="text-[11px] text-neutral-400">{t('support.subtitle')}</p></div></div>
            {activeId && <button type="button" onClick={() => setShowNew(true)} className="rounded-full p-2 hover:bg-white/10" aria-label={t('support.newConversation')}><Plus className="size-4" /></button>}
          </header>

          {authenticated && own.data && own.data.items.length > 1 && !newFormVisible && (
            <select value={activeId ?? ''} onChange={(event) => setSelectedId(event.target.value)} className="m-3 rounded-lg border bg-background px-3 py-2 text-xs">
              {own.data.items.map((item) => <option key={item.id} value={item.id}>{item.reference} · {t(`support.status.${item.status}`)}</option>)}
            </select>
          )}

          {newFormVisible ? (
            <form onSubmit={submitCreate} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <div><h3 className="font-semibold">{t('support.startTitle')}</h3><p className="text-xs text-muted-foreground">{t('support.startCopy')}</p></div>
              {!authenticated && <><input required maxLength={120} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={t('support.name')} className="rounded-lg border bg-background px-3 py-2 text-sm" /><input required minLength={7} maxLength={32} dir="ltr" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder={t('support.phone')} className="rounded-lg border bg-background px-3 py-2 text-sm" /><input type="email" dir="ltr" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder={t('support.emailOptional')} className="rounded-lg border bg-background px-3 py-2 text-sm" /></>}
              {authenticated && <input minLength={7} maxLength={32} dir="ltr" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder={t('support.phoneOptional')} className="rounded-lg border bg-background px-3 py-2 text-sm" />}
              <input dir="ltr" value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} placeholder={t('support.orderOptional')} className="rounded-lg border bg-background px-3 py-2 text-sm uppercase" />
              <textarea required maxLength={2000} rows={6} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder={t('support.message')} className="resize-none rounded-lg border bg-background px-3 py-2 text-sm" />
              {createConversation.isError && <p className="text-xs text-red-600">{t('support.createError')}</p>}
              <div className="mt-auto flex gap-2">{activeId && <Button type="button" variant="outline" onClick={() => setShowNew(false)}>{t('common.cancel')}</Button>}<Button type="submit" disabled={!canCreate || createConversation.isPending} className="flex-1 bg-[#FF8C00] text-white hover:bg-[#e67e00]">{createConversation.isPending && <Loader2 className="size-4 animate-spin" />}{t('support.start')}</Button></div>
            </form>
          ) : messages.isPending || conversation.isPending || ownPending ? (
            <div className="flex flex-1 items-center justify-center"><Loader2 className="size-6 animate-spin text-[#FF8C00]" /></div>
          ) : messages.isError || conversation.isError || ownError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"><p className="text-sm text-red-600">{t('support.loadError')}</p><Button variant="outline" onClick={() => { void messages.refetch(); void conversation.refetch(); void own.refetch(); }}>{t('common.retry')}</Button></div>
          ) : (
            <>
              <div className="border-b px-4 py-2 text-xs text-muted-foreground"><bdi>{conversation.data?.reference}</bdi>{conversation.data?.order && <> · <bdi>{conversation.data.order.orderNumber}</bdi></>} · {t(`support.status.${conversation.data?.status ?? 'OPEN'}`)}</div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {messages.data?.items.map((message) => {
                  const mine = message.senderType === 'CUSTOMER';
                  return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 ${mine ? 'bg-[#FF8C00] text-white' : 'border bg-background'}`}><p className="text-[10px] font-semibold opacity-70">{message.senderDisplayName}</p><p className="whitespace-pre-wrap break-words text-sm">{message.body}</p><time className="mt-1 block text-[9px] opacity-60">{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'en-TN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.createdAt))}</time></div></div>;
                })}
              </div>
              {closed ? <div className="border-t p-4 text-center text-xs text-muted-foreground">{t('support.closedCopy')}</div> : <form onSubmit={(event) => { event.preventDefault(); if (draft.trim()) sendMessage.mutate(draft.trim()); }} className="flex gap-2 border-t p-3"><textarea rows={2} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t('support.reply')} className="min-h-10 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm" /><Button type="submit" size="icon" disabled={!draft.trim() || sendMessage.isPending} className="self-end bg-[#FF8C00] text-white hover:bg-[#e67e00]">{sendMessage.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}<span className="sr-only">{t('support.send')}</span></Button></form>}
            </>
          )}
        </section>
      )}
    </>
  );
}
