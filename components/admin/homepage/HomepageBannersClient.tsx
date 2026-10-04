'use client';

import { FormEvent, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Film, ImageIcon, Loader2, Plus, Search, Trash2, Undo2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { homepageAdminApi } from '@/lib/api/homepage';
import { promotionsApi } from '@/lib/api/promotions';
import { commerceErrorMessage } from '@/lib/api/errors';
import { useTranslations } from '@/lib/hooks/use-translations';
import type { HomepageBannerAdminDto, HomepageBannerPlacement, HomepageBannerTranslation, HomepageBannerUpdatePayload } from '@/types/homepage';

const placements: HomepageBannerPlacement[] = ['HERO_SLIDER', 'TOP_BAR', 'MIDDLE_BANNER', 'SIDE_BANNER'];
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageBytes = 8 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;
const emptyTranslation: HomepageBannerTranslation = { title: '', subtitle: null, description: null, ctaLabel: null };

function toDateInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function validateImage(file: File | null, error: (message: string) => void, t: (key: string) => string) {
  if (!file) return true;
  if (!imageTypes.includes(file.type)) { error(t('homepage.imageTypeError')); return false; }
  if (file.size > maxImageBytes) { error(t('homepage.imageSizeError')); return false; }
  return true;
}

function validateVideo(file: File | null, error: (message: string) => void, t: (key: string) => string) {
  if (!file) return true;
  if (file.type.toLowerCase() !== 'video/mp4') { error(t('homepage.videoTypeError')); return false; }
  if (file.size > maxVideoBytes) { error(t('homepage.videoSizeError')); return false; }
  return true;
}

export function HomepageBannersClient() {
  const { t } = useTranslations();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [placement, setPlacement] = useState<HomepageBannerPlacement | ''>('');
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
  const [editor, setEditor] = useState<{ open: boolean; banner: HomepageBannerAdminDto | null }>({ open: false, banner: null });
  const list = useQuery({
    queryKey: ['admin-homepage-banners', page, search, placement, active],
    queryFn: () => homepageAdminApi.list({ page, limit: 20, search: search.trim() || undefined, placement: placement || undefined, isActive: active === 'all' ? undefined : active === 'true' }),
  });
  const invalidate = () => client.invalidateQueries({ queryKey: ['admin-homepage-banners'] });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => homepageAdminApi.toggle(id, isActive),
    onSuccess: () => { invalidate(); toast.success(t('homepage.statusUpdated')); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('homepage.statusError'))),
  });
  const remove = useMutation({
    mutationFn: homepageAdminApi.delete,
    onSuccess: () => { invalidate(); toast.success(t('homepage.deleted')); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('homepage.deleteError'))),
  });
  const accessDenied = list.isError && axios.isAxiosError(list.error) && list.error.response?.status === 403;

  if (accessDenied) return <div className="rounded-xl border bg-card p-10 text-center"><h1 className="font-serif text-3xl">{t('homepage.accessDenied')}</h1><p className="mt-3 text-muted-foreground">{t('homepage.accessDeniedCopy')}</p></div>;

  return <div className="space-y-6" dir="auto">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-serif text-3xl">{t('homepage.adminTitle')}</h1><p className="mt-2 text-sm text-muted-foreground">{t('homepage.adminCopy')}</p></div><Button onClick={() => setEditor({ open: true, banner: null })}><Plus className="size-4" />{t('homepage.add')}</Button></div>
    <Card>
      <CardHeader><CardTitle>{t('homepage.directory')}</CardTitle><CardDescription>{t('homepage.directoryCopy')}</CardDescription><div className="grid gap-3 pt-3 md:grid-cols-[1fr_220px_180px]">
        <div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t('homepage.search')} className="ps-9" /></div>
        <select value={placement} onChange={(event) => { setPlacement(event.target.value as HomepageBannerPlacement | ''); setPage(1); }} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">{t('homepage.allPlacements')}</option>{placements.map((item) => <option key={item} value={item}>{t(`homepage.placement.${item}`)}</option>)}</select>
        <select value={active} onChange={(event) => { setActive(event.target.value as typeof active); setPage(1); }} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="all">{t('homepage.allStatuses')}</option><option value="true">{t('status.ACTIVE')}</option><option value="false">{t('status.INACTIVE')}</option></select>
      </div></CardHeader>
      <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{t('homepage.media')}</TableHead><TableHead>{t('homepage.content')}</TableHead><TableHead>{t('homepage.placement')}</TableHead><TableHead>{t('homepage.schedule')}</TableHead><TableHead>{t('homepage.promotion')}</TableHead><TableHead>{t('homepage.status')}</TableHead><TableHead className="text-end">{t('admin.tableActions')}</TableHead></TableRow></TableHeader><TableBody>
        {list.isLoading && Array.from({ length: 4 }, (_, index) => <TableRow key={index}><TableCell colSpan={7}><div className="my-2 h-14 animate-pulse rounded bg-muted" /></TableCell></TableRow>)}
        {list.isError && !accessDenied && <TableRow><TableCell colSpan={7} className="py-12 text-center"><p>{t('homepage.loadError')}</p><Button variant="outline" className="mt-3" onClick={() => list.refetch()}>{t('common.retry')}</Button></TableCell></TableRow>}
        {!list.isLoading && !list.isError && !list.data?.items.length && <TableRow><TableCell colSpan={7} className="py-16 text-center text-muted-foreground">{t('homepage.empty')}</TableCell></TableRow>}
        {list.data?.items.map((banner) => <TableRow key={banner.id}>
          <TableCell><div className="flex min-w-28 items-center gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">{banner.desktopImageUrl || banner.mobileImageUrl ? <CommerceImage src={banner.desktopImageUrl ?? banner.mobileImageUrl} alt={banner.translations.en?.title ?? ''} sizes="64px" /> : banner.desktopVideoUrl || banner.mobileVideoUrl ? <Film className="absolute inset-0 m-auto size-5 text-muted-foreground" /> : <ImageIcon className="absolute inset-0 m-auto size-5 text-muted-foreground" />}</div><div className="space-y-1 text-xs text-muted-foreground"><MediaIndicator label={t('homepage.desktopMedia')} image={banner.desktopImageUrl} video={banner.desktopVideoUrl} t={t} /><MediaIndicator label={t('homepage.mobileMedia')} image={banner.mobileImageUrl} video={banner.mobileVideoUrl} t={t} /></div></div></TableCell>
          <TableCell><p className="max-w-56 truncate font-medium">{banner.translations.en?.title || banner.translations.ar?.title}</p><p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">{banner.ctaUrl || '—'}</p></TableCell>
          <TableCell><Badge variant="outline">{t(`homepage.placement.${banner.placement}`)}</Badge><p className="mt-1 text-xs text-muted-foreground">{t('homepage.sortOrderValue', { order: banner.sortOrder })}</p></TableCell>
          <TableCell className="min-w-44 text-xs text-muted-foreground"><p>{banner.startsAt ? new Date(banner.startsAt).toLocaleString() : t('homepage.immediately')}</p><p>{banner.endsAt ? new Date(banner.endsAt).toLocaleString() : t('homepage.noEnd')}</p></TableCell>
          <TableCell className="max-w-40 truncate text-sm">{banner.promotion?.name ?? '—'}</TableCell>
          <TableCell><Switch checked={banner.isActive} disabled={toggle.isPending} onCheckedChange={(checked) => toggle.mutate({ id: banner.id, isActive: checked })} aria-label={t('homepage.toggleStatus', { title: banner.translations.en?.title ?? '' })} /></TableCell>
          <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setEditor({ open: true, banner })} aria-label={t('common.edit')}><Edit className="size-4" /></Button><Button variant="ghost" size="icon" disabled={remove.isPending} onClick={() => { if (window.confirm(t('homepage.deleteConfirm', { title: banner.translations.en?.title ?? '' }))) remove.mutate(banner.id); }} aria-label={t('common.delete')}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
        </TableRow>)}
      </TableBody></Table></div>
      {list.data?.pagination && list.data.pagination.totalPages > 1 && <div className="flex items-center justify-between border-t p-4 text-sm"><span>{t('account.pageOf', { page, total: list.data.pagination.totalPages })}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t('common.previous')}</Button><Button variant="outline" size="sm" disabled={page >= list.data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>{t('common.next')}</Button></div></div>}
      </CardContent>
    </Card>
    {editor.open && <BannerEditor key={editor.banner?.id ?? 'new'} open banner={editor.banner} onClose={() => setEditor({ open: false, banner: null })} onSaved={invalidate} />}
  </div>;
}

function BannerEditor({ open, banner, onClose, onSaved }: { open: boolean; banner: HomepageBannerAdminDto | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslations();
  const [placement, setPlacement] = useState<HomepageBannerPlacement>(banner?.placement ?? 'HERO_SLIDER');
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl ?? '');
  const [sortOrder, setSortOrder] = useState(banner?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [startsAt, setStartsAt] = useState(toDateInput(banner?.startsAt ?? null));
  const [endsAt, setEndsAt] = useState(toDateInput(banner?.endsAt ?? null));
  const [promotionId, setPromotionId] = useState(banner?.promotionId ?? '');
  const [en, setEn] = useState<HomepageBannerTranslation>(banner?.translations.en ?? emptyTranslation);
  const [ar, setAr] = useState<HomepageBannerTranslation>(banner?.translations.ar ?? emptyTranslation);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopVideo, setDesktopVideo] = useState<File | null>(null);
  const [mobileVideo, setMobileVideo] = useState<File | null>(null);
  const [removeDesktopVideo, setRemoveDesktopVideo] = useState(false);
  const [removeMobileVideo, setRemoveMobileVideo] = useState(false);
  const promotions = useQuery({ queryKey: ['homepage-promotion-options'], queryFn: () => promotionsApi.listCoupons({ page: 1, limit: 100, isActive: true }).then((response) => response.data.data.items), enabled: open });
  const save = useMutation({
    mutationFn: (payload: HomepageBannerUpdatePayload) => {
      const files = { desktopImage, mobileImage, desktopVideo, mobileVideo };
      return banner ? homepageAdminApi.update(banner.id, payload, files) : homepageAdminApi.create(payload, files);
    },
    onSuccess: () => { onSaved(); toast.success(t(banner ? 'homepage.updated' : 'homepage.created')); onClose(); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('homepage.saveError'))),
  });

  const updateTranslation = (locale: 'en' | 'ar', field: keyof HomepageBannerTranslation, value: string) => {
    const setter = locale === 'en' ? setEn : setAr;
    setter((current) => field === 'title' ? { ...current, title: value } : { ...current, [field]: value || null });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!en.title.trim()) { toast.error(t('homepage.englishTitleRequired')); return; }
    if (Object.values(ar).some(Boolean) && !ar.title?.trim()) { toast.error(t('homepage.arabicTitleRequired')); return; }
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) { toast.error(t('homepage.dateError')); return; }
    if (!validateImage(desktopImage, toast.error, t) || !validateImage(mobileImage, toast.error, t)) return;
    if (!validateVideo(desktopVideo, toast.error, t) || !validateVideo(mobileVideo, toast.error, t)) return;
    const payload: HomepageBannerUpdatePayload = {
      placement, ctaUrl: ctaUrl.trim() || null, sortOrder, isActive,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      promotionId: promotionId || null,
      translations: { en: { ...en, title: en.title.trim() }, ...(Object.values(ar).some(Boolean) ? { ar: { ...ar, title: ar.title.trim() } } : {}) },
      ...(banner && removeDesktopVideo && !desktopVideo ? { removeDesktopVideo: true } : {}),
      ...(banner && removeMobileVideo && !mobileVideo ? { removeMobileVideo: true } : {}),
    };
    save.mutate(payload);
  };

  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>{t(banner ? 'homepage.editTitle' : 'homepage.createTitle')}</DialogTitle><DialogDescription>{t('homepage.editorCopy')}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2"><TranslationFields locale="en" value={en} onChange={(field, value) => updateTranslation('en', field, value)} t={t} /><TranslationFields locale="ar" value={ar} onChange={(field, value) => updateTranslation('ar', field, value)} t={t} /></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label={t('homepage.placement')}><select value={placement} onChange={(event) => setPlacement(event.target.value as HomepageBannerPlacement)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">{placements.map((item) => <option key={item} value={item}>{t(`homepage.placement.${item}`)}</option>)}</select></Field><Field label={t('homepage.sortOrder')}><Input type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Math.max(0, Number(event.target.value)))} /></Field><Field label={t('homepage.promotion')}><select value={promotionId} onChange={(event) => setPromotionId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">{t('homepage.noPromotion')}</option>{promotions.data?.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name}{promotion.code ? ` · ${promotion.code}` : ''}</option>)}</select></Field></div>
    <Field label={t('homepage.ctaUrl')}><Input value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} maxLength={500} placeholder="/products?brand=nike" dir="ltr" /></Field>
    <div className="grid gap-4 sm:grid-cols-2"><Field label={t('homepage.startsAt')}><Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></Field><Field label={t('homepage.endsAt')}><Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><ImageField id="desktop-banner" label={t('homepage.desktopImage')} current={banner?.desktopImageUrl ?? null} file={desktopImage} onChange={setDesktopImage} t={t} /><ImageField id="mobile-banner" label={t('homepage.mobileImage')} current={banner?.mobileImageUrl ?? null} file={mobileImage} onChange={setMobileImage} t={t} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><VideoField id="desktop-banner-video" label={t('homepage.desktopVideo')} currentLabel={t('homepage.currentDesktopVideo')} current={banner?.desktopVideoUrl ?? null} file={desktopVideo} removeCurrent={removeDesktopVideo} onFileChange={(file) => { setDesktopVideo(file); if (file) setRemoveDesktopVideo(false); }} onRemoveChange={setRemoveDesktopVideo} t={t} /><VideoField id="mobile-banner-video" label={t('homepage.mobileVideo')} currentLabel={t('homepage.currentMobileVideo')} current={banner?.mobileVideoUrl ?? null} file={mobileVideo} removeCurrent={removeMobileVideo} onFileChange={(file) => { setMobileVideo(file); if (file) setRemoveMobileVideo(false); }} onRemoveChange={setRemoveMobileVideo} t={t} /></div>
    <div className="flex items-center justify-between rounded-lg border p-4"><div><Label htmlFor="homepage-active">{t('homepage.active')}</Label><p className="mt-1 text-xs text-muted-foreground">{t('homepage.activeHelp')}</p></div><Switch id="homepage-active" checked={isActive} onCheckedChange={setIsActive} /></div>
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button><Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="size-4 animate-spin" />}{t(save.isPending ? 'homepage.saving' : banner ? 'homepage.update' : 'homepage.create')}</Button></div>
  </form></DialogContent></Dialog>;
}

function TranslationFields({ locale, value, onChange, t }: { locale: 'en' | 'ar'; value: HomepageBannerTranslation; onChange: (field: keyof HomepageBannerTranslation, value: string) => void; t: (key: string) => string }) {
  return <fieldset dir={locale === 'ar' ? 'rtl' : 'ltr'} className="space-y-3 rounded-xl border p-4"><legend className="px-2 font-semibold">{t(locale === 'en' ? 'homepage.englishContent' : 'homepage.arabicContent')}</legend><Field label={t('homepage.title')}><Input value={value.title} onChange={(event) => onChange('title', event.target.value)} maxLength={255} required={locale === 'en'} /></Field><Field label={t('homepage.subtitle')}><Input value={value.subtitle ?? ''} onChange={(event) => onChange('subtitle', event.target.value)} maxLength={255} /></Field><Field label={t('homepage.description')}><textarea value={value.description ?? ''} onChange={(event) => onChange('description', event.target.value)} maxLength={10000} rows={3} className="w-full rounded-md border bg-background p-3 text-sm" /></Field><Field label={t('homepage.ctaLabel')}><Input value={value.ctaLabel ?? ''} onChange={(event) => onChange('ctaLabel', event.target.value)} maxLength={100} /></Field></fieldset>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="flex flex-col gap-2"><span className="text-sm font-medium leading-none">{label}</span>{children}</label>; }

function ImageField({ id, label, current, file, onChange, t }: { id: string; label: string; current: string | null; file: File | null; onChange: (file: File | null) => void; t: (key: string) => string }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{current && <div className="relative aspect-[16/7] overflow-hidden rounded-lg border bg-muted"><CommerceImage src={current} alt={label} sizes="400px" /></div>}<Input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />{file && <p className="truncate text-xs text-muted-foreground">{t('homepage.selectedFile')}: {file.name}</p>}<p className="text-xs text-muted-foreground">{t('homepage.imageHelp')}</p></div>;
}

function VideoField({ id, label, currentLabel, current, file, removeCurrent, onFileChange, onRemoveChange, t }: { id: string; label: string; currentLabel: string; current: string | null; file: File | null; removeCurrent: boolean; onFileChange: (file: File | null) => void; onRemoveChange: (remove: boolean) => void; t: (key: string) => string }) {
  const remove = () => {
    onFileChange(null);
    onRemoveChange(Boolean(current));
  };

  return <div className="space-y-3 rounded-lg border bg-card/40 p-4"><div><p className="text-sm font-medium leading-none">{label}</p><p className="mt-2 text-xs text-muted-foreground">{t('homepage.videoHelp')}</p></div>{current && !removeCurrent && <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">{currentLabel}</p><video src={current} controls playsInline preload="metadata" className="aspect-video w-full rounded-md border bg-black object-cover [transform:none]" aria-label={currentLabel} /></div>}{removeCurrent && <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs"><span>{t('homepage.videoWillBeRemoved')}</span><Button type="button" variant="ghost" size="sm" onClick={() => onRemoveChange(false)} aria-label={t('homepage.undoVideoRemoval')}><Undo2 className="size-4" />{t('homepage.undo')}</Button></div>}<Input key={`${file?.name ?? 'empty'}-${removeCurrent}`} id={id} type="file" accept="video/mp4" className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} /><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" asChild><Label htmlFor={id} className="cursor-pointer">{current ? t('homepage.replaceVideo') : t('homepage.uploadVideo')}</Label></Button>{(current || file) && <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label={`${t('homepage.removeVideo')} — ${label}`}><X className="size-4" />{t('homepage.removeVideo')}</Button>}</div>{file && <p className="truncate text-xs text-muted-foreground">{t('homepage.selectedFile')}: {file.name}</p>}</div>;
}

function MediaIndicator({ label, image, video, t }: { label: string; image: string | null; video: string | null; t: (key: string) => string }) {
  const media = video ? t('homepage.video') : image ? t('homepage.image') : t('homepage.noMedia');
  return <p>{label}: {media}</p>;
}
