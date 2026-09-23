import type { Metadata } from 'next';
import { Playfair_Display, Geist } from 'next/font/google';
import './globals.css';
import SplashScreenWrapper from '@/components/SplashScreenWrapper';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    template: '%s | Shoezy',
    default: 'Shoezy — Quality Shoes. Every Step.',
  },
  description:
    'Discover our premium collection of footwear for men, women, and kids. Quality shoes delivered to your door with Cash on Delivery.',
  keywords: ['shoes', 'footwear', 'luxury shoes', 'sneakers', 'boots', 'Shoezy'],
  authors: [{ name: 'Shoezy' }],
  creator: 'Shoezy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Shoezy',
    title: 'Shoezy — Quality Shoes. Every Step.',
    description: 'Premium footwear collection for every occasion.',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={cn(playfair.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            {/* Splash screen — shows on first load AND while auth rehydrates */}
            <SplashScreenWrapper />
            {children}
            <Toaster
              position="bottom-right"
              richColors
              toastOptions={{
                style: { fontFamily: 'var(--font-sans)' },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
