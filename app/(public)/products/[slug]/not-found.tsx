import Link from 'next/link';
import { getServerTranslations } from '@/lib/i18n-server';

export default async function ProductNotFound() {
  const { t } = await getServerTranslations();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">404</p>
      <h1 className="mt-3 font-serif text-4xl">{t('product.notFound')}</h1>
      <p className="mt-3 text-muted-foreground">{t('product.notFoundCopy')}</p>
      <Link href="/products" className="mt-8 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{t('product.browse')}</Link>
    </div>
  );
}
