'use client';

import { Sparkles } from 'lucide-react';
import CouponsTab from './CouponsTab';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function PromotionsClient() {
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      {/* Unified Header & Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FF8C00]" /> {t('promotion.adminTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('promotion.adminCopy')}
          </p>
        </div>

      </div>
      <CouponsTab />
    </div>
  );
}
