'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Bell, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { promotionsApi, type AnnouncementDto } from '@/lib/api/promotions';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementToEdit?: AnnouncementDto | null;
}

const COLOR_PRESETS = [
  { label: 'Brand Orange', bg: '#FF8C00', text: '#FFFFFF' },
  { label: 'Dark Navy', bg: '#1E293B', text: '#FFFFFF' },
  { label: 'Midnight Black', bg: '#09090B', text: '#FF8C00' },
  { label: 'Emerald Green', bg: '#059669', text: '#FFFFFF' },
  { label: 'Royal Blue', bg: '#2563EB', text: '#FFFFFF' },
];

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  announcementToEdit,
}: AnnouncementFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!announcementToEdit;

  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [bgColor, setBgColor] = useState('#FF8C00');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (announcementToEdit) {
      setMessage(announcementToEdit.message);
      setLink(announcementToEdit.link ?? '');
      setBgColor(announcementToEdit.bgColor);
      setTextColor(announcementToEdit.textColor);
      setDisplayOrder(announcementToEdit.displayOrder.toString());
      setIsActive(announcementToEdit.isActive);
    } else {
      setMessage('🎉 FREE SHIPPING ON ORDERS OVER 99 TND ACROSS TUNISIA');
      setLink('/products');
      setBgColor('#FF8C00');
      setTextColor('#FFFFFF');
      setDisplayOrder('0');
      setIsActive(true);
    }
  }, [announcementToEdit, isOpen]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        message: message.trim(),
        link: link.trim() || null,
        bgColor,
        textColor,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive,
      };

      if (isEditing && announcementToEdit) {
        return promotionsApi.updateAnnouncement(announcementToEdit.id, payload);
      }
      return promotionsApi.createAnnouncement(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Announcement updated' : 'Announcement created');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
      onClose();
    },
    onError: (err) => {
      let msg = 'Failed to save announcement';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Announcement message is required');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF8C00]">
            <Bell className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Announcement Bar' : 'Create Announcement Bar'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            Configure rotating top notification bar message, colors, and links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Live Preview Strip */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Live Storefront Preview
            </Label>
            <div
              className="px-4 py-2.5 rounded-xl flex items-center justify-center text-center text-xs font-semibold tracking-wider uppercase shadow-inner transition-colors duration-300"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              {message || 'Your announcement message will appear here...'}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Message Text <span className="text-red-500">*</span>
            </Label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 👟 USE CODE SHOEZY10 FOR 10% OFF YOUR FIRST ORDER!"
              className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF8C00]"
            />
          </div>

          {/* Optional Redirect Link */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Target Redirect Link (Optional)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /products or /new-arrivals"
              className="border-gray-200 focus:border-[#FF8C00] text-xs font-mono"
            />
          </div>

          {/* Color Presets & Pickers */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#FF8C00]" /> Color Palette Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setBgColor(preset.bg);
                    setTextColor(preset.text);
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    bgColor === preset.bg ? 'border-gray-900 shadow-sm ring-1 ring-gray-900' : 'border-gray-200'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer p-0"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="border-gray-200 focus:border-[#FF8C00] font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer p-0"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="border-gray-200 focus:border-[#FF8C00] font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Display Order & Active Toggle */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Display Order</Label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Label className="text-xs font-bold text-gray-900 cursor-pointer">Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs border-gray-200">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-6 shadow-md shadow-[#FF8C00]/20"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Announcement'
              ) : (
                'Create Announcement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
