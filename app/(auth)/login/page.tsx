import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Shoezy account to access your orders, wishlist, and more.',
};

export default function LoginPage() {
  return <LoginForm />;
}
