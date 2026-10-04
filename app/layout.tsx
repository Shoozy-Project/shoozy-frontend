import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Playfair_Display, Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import SplashScreenWrapper from '@/components/SplashScreenWrapper';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { cn } from "@/lib/utils";
import { ThemedToaster } from '@/components/theme/ThemedToaster';
import { THEME_BOOTSTRAP_SCRIPT } from '@/lib/theme';
import { LOCALE_BOOTSTRAP_SCRIPT } from '@/lib/i18n';
import { LocaleProvider } from '@/providers/locale-provider';
import { NotificationSocketProvider } from '@/providers/notification-socket-provider';
import { getServerTranslations } from '@/lib/i18n-server';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: '400',
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getServerTranslations();
  return {
    title: { template: '%s | Shoozy', default: t('meta.defaultTitle') },
    description: t('meta.defaultDescription'),
    keywords: locale === 'ar' ? ['أحذية', 'أحذية فاخرة', 'أحذية رياضية', 'شوزي'] : ['shoes', 'footwear', 'luxury shoes', 'sneakers', 'boots', 'Shoozy'],
    authors: [{ name: 'Shoozy' }],
    creator: 'Shoozy',
    openGraph: { type: 'website', locale: locale === 'ar' ? 'ar_TN' : 'en_US', siteName: 'Shoozy', title: t('meta.defaultTitle'), description: t('meta.ogDescription') },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('shoozy-locale')?.value === 'ar' ? 'ar' : 'en';
  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={cn(playfair.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Script
          id="shoozy-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
        <Script
          id="shoozy-locale-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: LOCALE_BOOTSTRAP_SCRIPT }}
        />
        <QueryProvider>
          <LocaleProvider>
          <ThemeProvider>
            <NotificationSocketProvider />
            {/* Splash screen — shows on first load AND while auth rehydrates */}
            <SplashScreenWrapper />
            {children}
            <ThemedToaster />
          </ThemeProvider>
          </LocaleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
