import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for all public-facing customer pages.
 * Wraps content with the shared Header and Footer.
 * Auth pages and Admin pages have their own separate layouts.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
