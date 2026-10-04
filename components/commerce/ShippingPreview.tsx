'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, MapPin } from 'lucide-react';
import { catalogApi } from '@/lib/api/catalog';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ShippingPreview({ slug }: { slug: string }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const preview = useMutation({
    mutationFn: () => catalogApi.shippingPreview(slug, { countryCode: 'TN', state: state.trim(), city: city.trim(), area: area.trim() || null }).then((response) => response.data.data),
  });

  return (
    <section className="mt-8 border-t border-border pt-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="size-4 text-[#FF8C00]" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-widest">{t('shipping.deliverTo')}</h2>
      </div>
      <form
        className="grid gap-2 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (state.trim() && city.trim()) preview.mutate();
        }}
      >
        <input value={state} onChange={(event) => setState(event.target.value)} required maxLength={120} placeholder={t('shipping.state')} className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm" />
        <input value={city} onChange={(event) => setCity(event.target.value)} required maxLength={120} placeholder={t('shipping.city')} className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm" />
        <input value={area} onChange={(event) => setArea(event.target.value)} maxLength={120} placeholder={t('shipping.area')} className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm sm:col-span-2" />
        <button type="submit" disabled={preview.isPending} className="mt-1 inline-flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-xs font-semibold uppercase tracking-wider text-background disabled:opacity-50 sm:col-span-2">
          {preview.isPending && <Loader2 className="size-4 animate-spin" />}
          {t(preview.isPending ? 'shipping.checking' : 'shipping.check')}
        </button>
      </form>

      {preview.isError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{commerceErrorMessage(preview.error, t('shipping.error'))}</p>}
      {preview.data && !preview.data.available && <p className="mt-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">{t('shipping.unavailable')}</p>}
      {preview.data?.available && (
        <div className="mt-4 divide-y rounded-md border">
          {preview.data.methods.map((method) => (
            <div key={method.id} className="flex items-start justify-between gap-4 p-3 text-sm">
              <div>
                <p className="font-medium">{method.name}</p>
                {method.estimatedMinDays !== null && method.estimatedMaxDays !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">{t('shipping.businessDays', { min: method.estimatedMinDays, max: method.estimatedMaxDays })}</p>
                )}
              </div>
              <p className="shrink-0 font-semibold">{formatMinorMoney(method.priceMinor, method.currency, undefined, intlLocale)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
