import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Shoezy and discover premium footwear. Create your account today.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
