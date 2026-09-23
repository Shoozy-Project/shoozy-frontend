import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getServerTranslations } from '@/lib/i18n-server';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = await getServerTranslations();
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-80px)]">
        {/* ── Left: Form Panel ── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24 bg-[var(--surface-primary)] overflow-y-auto transition-colors duration-300">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>

        {/* ── Right: Hero Image Panel ── */}
        <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative overflow-hidden">
          <Image
            src="/auth-hero.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw"
            className="object-cover object-center"
            priority
          />
          {/* Subtle dark overlay at the bottom for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {/* Brand quote overlay */}
          <div className="absolute bottom-10 inset-x-8">
            <p className="text-white font-serif text-xl italic leading-relaxed drop-shadow-lg">
              &ldquo;{t('auth.quote')}&rdquo;
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
