import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.registerTitle'), description: t('meta.registerDescription') }; }

export default function RegisterPage() {
  return <RegisterForm />;
}
