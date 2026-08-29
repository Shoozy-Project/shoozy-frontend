'use client';

import { useState } from 'react';
import { Tag, Image as ImageIcon, Bell, Sparkles } from 'lucide-react';
import CouponsTab from './CouponsTab';
import BannersTab from './BannersTab';
import AnnouncementsTab from './AnnouncementsTab';

type PromotionTab = 'coupons' | 'banners' | 'announcements';

export default function PromotionsClient() {
  const [activeTab, setActiveTab] = useState<PromotionTab>('coupons');

  return (
    <div className="space-y-6">
      {/* Unified Header & Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FF8C00]" /> Marketing & Promotions Engine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage store coupons, homepage hero carousel sliders, and top announcement tickers in one unified dashboard.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pt-2 pb-1">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'coupons'
                ? 'bg-[#FF8C00] text-white shadow-md shadow-[#FF8C00]/20'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            Coupons & Promo Codes
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'banners'
                ? 'bg-[#FF8C00] text-white shadow-md shadow-[#FF8C00]/20'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Hero Carousel Banners
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'announcements'
                ? 'bg-[#FF8C00] text-white shadow-md shadow-[#FF8C00]/20'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Top Announcement Bars
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'coupons' && <CouponsTab />}
      {activeTab === 'banners' && <BannersTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}
    </div>
  );
}
