'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { promotionsApi, type CouponDto } from '@/lib/api/promotions';
import { useTranslations } from '@/lib/hooks/use-translations';
import CouponsListTab from './CouponsListTab';

const CouponFormModal = dynamic(() => import('./CouponFormModal'), { ssr: false });
const DeleteCouponDialog = dynamic(() => import('./DeleteCouponDialog'), { ssr: false });

type TabId = 'ALL' | 'ACTIVE' | 'ARCHIVED';

export default function CouponsTab() {
  const queryClient = useQueryClient();
  const { locale, t } = useTranslations();
  
  const [activeTab, setActiveTab] = useState<TabId>('ALL');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState<CouponDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponDto | null>(null);
  const [detailTarget, setDetailTarget] = useState<CouponDto | null>(null);

  const list = useQuery({
    queryKey: ['admin-promotions', page, limit, debouncedSearch],
    queryFn: () => promotionsApi.listCoupons({ page, limit, search: debouncedSearch.trim() || undefined }).then((response) => response.data.data),
    placeholderData: (previous) => previous,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
  
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => promotionsApi.toggleCouponActive(id, active),
    onSuccess: () => { toast.success(t('promotion.statusUpdated')); void refresh(); },
    onError: () => toast.error(t('promotion.statusError')),
  });
  
  const archive = useMutation({
    mutationFn: promotionsApi.archive,
    onSuccess: () => { toast.success(t('promotion.archived')); void refresh(); },
    onError: () => toast.error(t('promotion.archiveError')),
  });

  const filteredItems = (list.data?.items || []).filter(item => {
    if (activeTab === 'ACTIVE') return item.status === 'ACTIVE' || item.status === 'SCHEDULED';
    if (activeTab === 'ARCHIVED') return item.status === 'ARCHIVED' || item.status === 'EXPIRED' || item.status === 'DISABLED';
    return true; // ALL
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 tracking-tight">
            <Sparkles className="size-6 text-[#FF8C00]" />
            {t('promotion.title')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-medium">{t('promotion.copy')}</p>
        </div>
        <Button 
          onClick={() => { setPromotionToEdit(null); setModalOpen(true); }} 
          className="bg-[#FF8C00] text-white hover:bg-[#e67e00] hover:shadow-md transition-all px-6 font-semibold rounded-full"
        >
          <Plus className="size-4 me-2 stroke-[3px]" /> Create New
        </Button>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex space-x-8 border-b border-gray-200">
        {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
              activeTab === tab
                ? 'text-[#FF8C00]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'ALL' ? 'All Discounts' : tab === 'ACTIVE' ? 'Active & Scheduled' : 'Archived & Expired'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF8C00] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CouponsListTab 
          items={filteredItems}
          listData={list}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          toggle={toggle}
          archive={archive}
          setPromotionToEdit={setPromotionToEdit}
          setModalOpen={setModalOpen}
          setDetailTarget={setDetailTarget}
          setDeleteTarget={setDeleteTarget}
          locale={locale}
          t={t}
        />
      </div>

      {/* Modals */}
      {modalOpen && <CouponFormModal key={promotionToEdit?.id ?? 'new'} isOpen onClose={() => setModalOpen(false)} couponToEdit={promotionToEdit} />}
      {deleteTarget && <DeleteCouponDialog isOpen={true} onClose={() => setDeleteTarget(null)} coupon={deleteTarget} />}
    </div>
  );
}
