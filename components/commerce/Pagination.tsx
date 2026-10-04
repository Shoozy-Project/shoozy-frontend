'use client';

import Link from 'next/link';
import type { Pagination as PaginationDto } from '@/types/api';
import { useTranslations } from '@/lib/hooks/use-translations';

function pageHref(pathname: string, current: URLSearchParams, page: number) {
  const params = new URLSearchParams(current);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({ pagination, pathname, searchParams }: { pagination: PaginationDto; pathname: string; searchParams?: Record<string, string | string[] | undefined> }) {
  const { t } = useTranslations();
  if (pagination.totalPages <= 1) return null;
  const current = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') current.set(key, value);
  });
  const first = Math.max(1, pagination.page - 2);
  const last = Math.min(pagination.totalPages, pagination.page + 2);
  const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index);

  return (
    <nav aria-label={t('catalog.pagination')} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {pagination.page > 1 ? (
        <Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href={pageHref(pathname, current, pagination.page - 1)}>{t('common.previous')}</Link>
      ) : <span className="rounded-md border px-3 py-2 text-sm opacity-40">{t('common.previous')}</span>}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(pathname, current, page)}
          aria-current={page === pagination.page ? 'page' : undefined}
          className={`min-w-9 rounded-md border px-3 py-2 text-center text-sm ${page === pagination.page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          {page}
        </Link>
      ))}
      {pagination.page < pagination.totalPages ? (
        <Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href={pageHref(pathname, current, pagination.page + 1)}>{t('common.next')}</Link>
      ) : <span className="rounded-md border px-3 py-2 text-sm opacity-40">{t('common.next')}</span>}
    </nav>
  );
}
