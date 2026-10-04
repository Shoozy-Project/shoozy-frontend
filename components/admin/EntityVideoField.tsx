'use client';

import { useEffect, useId, useState } from 'react';
import { Film, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/hooks/use-translations';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

interface EntityVideoFieldProps {
  existingVideoUrl?: string | null;
  disabled?: boolean;
  onChange: (file: File | null, removeVideo: boolean) => void;
}

export function EntityVideoField({ existingVideoUrl, disabled, onChange }: EntityVideoFieldProps) {
  const { t } = useTranslations();
  const inputId = useId();
  const [selection, setSelection] = useState<{ file: File; url: string } | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const previewUrl = selection?.url ?? (!removeExisting ? existingVideoUrl : null);

  useEffect(() => () => {
    if (selection?.url) URL.revokeObjectURL(selection.url);
  }, [selection?.url]);

  const select = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'video/mp4') { toast.error(t('admin.animationVideoTypeError')); return; }
    if (file.size > MAX_VIDEO_BYTES) { toast.error(t('admin.animationVideoSizeError')); return; }
    const url = URL.createObjectURL(file);
    setSelection({ file, url });
    setRemoveExisting(false);
    onChange(file, false);
  };

  const remove = () => {
    if (selection) {
      setSelection(null);
      setRemoveExisting(false);
      onChange(null, false);
      return;
    }
    setRemoveExisting(true);
    onChange(null, true);
  };

  const restore = () => {
    setRemoveExisting(false);
    onChange(null, false);
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div><Label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{t('admin.animationVideo')}</Label><p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">{t('admin.animationVideoSupport')}</p></div>
      {previewUrl && <div><p className="mb-2 text-xs font-medium text-gray-600 dark:text-neutral-300">{selection ? t('admin.selectedAnimation') : t('admin.currentAnimation')}</p><video key={previewUrl} src={previewUrl} controls playsInline preload="metadata" className="aspect-video w-full rounded-lg bg-black object-contain" /></div>}
      {removeExisting && <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><span>{t('admin.animationWillBeRemoved')}</span><Button type="button" size="sm" variant="ghost" onClick={restore} disabled={disabled}><RotateCcw className="size-3.5" />{t('admin.undoRemoveAnimation')}</Button></div>}
      <div className="flex flex-wrap gap-2">
        <label htmlFor={inputId} className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" aria-disabled={disabled}>
          {previewUrl ? <Film className="size-4" /> : <Upload className="size-4" />}{t(previewUrl ? 'admin.replaceAnimation' : 'admin.chooseAnimation')}
          <input id={inputId} type="file" accept="video/mp4" className="sr-only" disabled={disabled} onChange={(event) => { select(event.target.files?.[0] ?? null); event.target.value = ''; }} />
        </label>
        {previewUrl && <Button type="button" variant="outline" onClick={remove} disabled={disabled}><Trash2 className="size-4 text-red-500" />{t(selection ? 'admin.clearSelectedAnimation' : 'admin.removeAnimation')}</Button>}
      </div>
    </div>
  );
}
