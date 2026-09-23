'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo / Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-serif text-2xl tracking-widest text-white">
              SHOOZY
            </Link>
          </div>

          {/* Links 1 */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">{t('footer.customerService')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.collections')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Rules - Cash on Delivery */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">{t('footer.payment')}</h4>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              {t('footer.paymentCopy')}
            </p>
            <div className="inline-block border border-white/20 px-4 py-2 text-xs tracking-widest uppercase">
              {t('footer.codOnly')}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 tracking-wider">
          <p>&copy; {new Date().getFullYear()} SHOOZY. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
