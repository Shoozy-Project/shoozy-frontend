'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { promotionsApi, type BannerDto } from '@/lib/api/promotions';
import dynamic from 'next/dynamic';

const BannerFormModal = dynamic(() => import('./BannerFormModal'), { ssr: false });

export default function BannersTab() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<BannerDto | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const res = await promotionsApi.listBanners();
      return res.data.data;
    },
  });

  if (isError) {
    console.error('Error fetching admin banners:', error);
  }

  const banners = Array.isArray(data) ? data : [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionsApi.toggleBannerActive(id, isActive),
    onSuccess: () => {
      toast.success('Banner status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['public-banners'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.deleteBanner(id),
    onSuccess: () => {
      toast.success('Hero Banner deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['public-banners'] });
    },
    onError: () => toast.error('Failed to delete hero banner'),
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: Array<{ id: string; displayOrder: number }>) =>
      promotionsApi.reorderBanners(orders),
    onSuccess: () => {
      toast.success('Banner order updated');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['public-banners'] });
    },
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;

    const orders = newBanners.map((b, idx) => ({ id: b.id, displayOrder: idx + 1 }));
    reorderMutation.mutate(orders);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#FF8C00]" /> Homepage Hero Carousel Banners
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage main storefront carousel slides, CTAs, and promotional ads.
          </p>
        </div>
        <Button
          onClick={() => {
            setBannerToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md shadow-[#FF8C00]/20"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {/* Visual Card Grid */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading hero banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-6">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Hero Banners Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Add slider banners to showcase new arrivals, seasonal collections, and discounts on your storefront homepage.
          </p>
          <Button
            onClick={() => {
              setBannerToEdit(null);
              setModalOpen(true);
            }}
            className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create First Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b, idx) => (
            <Card
              key={b.id}
              className={`overflow-hidden border transition-all duration-200 ${
                b.isActive ? 'border-gray-200 hover:border-[#FF8C00]/50 shadow-sm' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Banner Image Preview Container */}
              <div className="relative w-full h-48 bg-gray-900">
                <Image
                  src={b.imageDesktopUrl}
                  alt={b.title}
                  fill
                  className="object-cover opacity-85"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    {b.badgeText ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-[#FF8C00] px-2.5 py-1 rounded-md shadow">
                        {b.badgeText}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Badge className={b.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                      {b.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight drop-shadow">
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className="text-xs text-gray-200 line-clamp-1 mt-0.5 font-medium">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Details & Actions */}
              <CardContent className="p-4 flex items-center justify-between gap-4 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <span>CTA: {b.ctaText || 'None'}</span>
                    {b.ctaLink && (
                      <span className="text-[10px] font-mono text-[#FF8C00] bg-[#FFF3E0] px-2 py-0.5 rounded flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {b.ctaLink}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Order Priority: #{b.displayOrder}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reordering */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === banners.length - 1}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Switch
                    checked={b.isActive}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: b.id, isActive: checked })
                    }
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBannerToEdit(b);
                      setModalOpen(true);
                    }}
                    className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete banner '${b.title}'?`)) {
                        deleteMutation.mutate(b.id);
                      }
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <BannerFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setBannerToEdit(null);
          }}
          bannerToEdit={bannerToEdit}
        />
      )}
    </div>
  );
}
