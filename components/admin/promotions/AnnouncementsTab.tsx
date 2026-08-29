'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { promotionsApi, type AnnouncementDto } from '@/lib/api/promotions';
import dynamic from 'next/dynamic';

const AnnouncementFormModal = dynamic(() => import('./AnnouncementFormModal'), { ssr: false });

export default function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<AnnouncementDto | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const res = await promotionsApi.listAnnouncements();
      return res.data.data;
    },
  });

  if (isError) {
    console.error('Error fetching admin announcements:', error);
  }

  const announcements = Array.isArray(data) ? data : [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionsApi.toggleAnnouncementActive(id, isActive),
    onSuccess: () => {
      toast.success('Announcement status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
    },
    onError: () => toast.error('Failed to delete announcement'),
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF8C00]" /> Top Announcement Ticker Bars
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage sticky header announcements, discount tickers, and storefront notification banners.
          </p>
        </div>
        <Button
          onClick={() => {
            setAnnouncementToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md shadow-[#FF8C00]/20"
        >
          <Plus className="w-4 h-4" /> Add Announcement
        </Button>
      </div>

      {/* Main List */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-white p-4">
          <CardTitle className="text-base font-bold text-gray-900">
            Storefront Tickers ({announcements.length})
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Active announcements auto-rotate every 4 seconds in the storefront navbar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No announcements found</p>
              <p className="text-xs text-gray-400 mt-1">
                Create a ticker using the "+ Add Announcement" button.
              </p>
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border transition-all ${
                  a.isActive ? 'border-gray-200 bg-white hover:border-[#FF8C00]/40 shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                {/* Visual Preview Strip */}
                <div
                  className="px-4 py-2 rounded-lg text-center text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between shadow-inner"
                  style={{ backgroundColor: a.bgColor, color: a.textColor }}
                >
                  <span className="truncate max-w-[80%]">{a.message}</span>
                  {a.link && (
                    <span className="text-[10px] opacity-80 flex items-center gap-1 font-mono">
                      <ExternalLink className="w-3 h-3" /> {a.link}
                    </span>
                  )}
                </div>

                {/* Details & Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="font-mono">Order: #{a.displayOrder}</span>
                    <span className="flex items-center gap-1">
                      Bg: <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: a.bgColor }} />
                    </span>
                    <Badge className={a.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}>
                      {a.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={a.isActive}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: a.id, isActive: checked })
                      }
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAnnouncementToEdit(a);
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
                        if (confirm('Delete this announcement?')) {
                          deleteMutation.mutate(a.id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {modalOpen && (
        <AnnouncementFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setAnnouncementToEdit(null);
          }}
          announcementToEdit={announcementToEdit}
        />
      )}
    </div>
  );
}
