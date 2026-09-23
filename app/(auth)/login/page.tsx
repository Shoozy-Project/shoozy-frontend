import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Shoezy account to access your orders, wishlist, and more.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const requested = (await searchParams).next;
  const redirectTo = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
  return <LoginForm redirectTo={redirectTo} />;
}
