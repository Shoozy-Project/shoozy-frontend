import 'server-only';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/messages';

export async function getServerLocale(): Promise<Locale> {
  return (await cookies()).get('shoozy-locale')?.value === 'ar' ? 'ar' : 'en';
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return { locale, t: (key: string, values?: Record<string, string | number>) => translate(locale, key, values) };
}
