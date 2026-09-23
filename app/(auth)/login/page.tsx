import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.loginTitle'), description: t('meta.loginDescription') }; }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const requested = (await searchParams).next;
  const redirectTo = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
  return <LoginForm redirectTo={redirectTo} />;
}
