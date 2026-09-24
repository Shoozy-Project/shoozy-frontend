import StorefrontHeader from '@/components/storefront/navigation/StorefrontHeader';
import Footer from '@/components/layout/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for all public-facing customer pages.
 * Wraps content with the luxury editorial StorefrontHeader and Footer.
 * Auth pages and Admin pages have their own separate layouts.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <StorefrontHeader />
      <main className="flex-1 w-full pt-[130px] md:pt-[150px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}

