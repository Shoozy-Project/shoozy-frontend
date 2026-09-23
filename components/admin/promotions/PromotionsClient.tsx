'use client';

import { Sparkles } from 'lucide-react';
import CouponsTab from './CouponsTab';

export default function PromotionsClient() {
  return (
    <div className="space-y-6">
      {/* Unified Header & Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FF8C00]" /> Discounts / Coupons
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage the backend-supported discount and coupon rules used at checkout.
          </p>
        </div>

      </div>
      <CouponsTab />
    </div>
  );
}
