import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for all public-facing customer pages.
 * Wraps content with the AnnouncementBar, shared Header, and Footer.
 * Auth pages and Admin pages have their own separate layouts.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
