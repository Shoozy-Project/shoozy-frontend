import 'server-only';
import type { Metadata } from 'next';
import { getServerTranslations } from '@/lib/i18n-server';

export async function adminMetadata(titleKey: string, descriptionKey: string): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return { title: t(titleKey), description: t(descriptionKey) };
}
