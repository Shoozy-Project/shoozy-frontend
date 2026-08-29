'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Image as ImageIcon, Loader2, Upload, ExternalLink } from 'lucide-react';
import Image from 'next/image';
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
import { promotionsApi, type BannerDto } from '@/lib/api/promotions';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: BannerDto | null;
}

export default function BannerFormModal({
  isOpen,
  onClose,
  bannerToEdit,
}: BannerFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!bannerToEdit;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [imageDesktopUrl, setImageDesktopUrl] = useState('');
  const [imageMobileUrl, setImageMobileUrl] = useState('');
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [ctaLink, setCtaLink] = useState('/products');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [uploadingDesktop, setUploadingDesktop] = useState(false);

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle ?? '');
      setBadgeText(bannerToEdit.badgeText ?? '');
      setImageDesktopUrl(bannerToEdit.imageDesktopUrl);
      setImageMobileUrl(bannerToEdit.imageMobileUrl ?? '');
      setCtaText(bannerToEdit.ctaText ?? '');
      setCtaLink(bannerToEdit.ctaLink ?? '');
      setDisplayOrder(bannerToEdit.displayOrder.toString());
      setIsActive(bannerToEdit.isActive);
    } else {
      setTitle('');
      setSubtitle('');
      setBadgeText('NEW ARRIVALS');
      setImageDesktopUrl('');
      setImageMobileUrl('');
      setCtaText('Shop Now');
      setCtaLink('/products');
      setDisplayOrder('0');
      setIsActive(true);
    }
  }, [bannerToEdit, isOpen]);

  const handleFileUpload = async (file: File) => {
    setUploadingDesktop(true);
    try {
      const res = await promotionsApi.uploadBannerImage(file);
      setImageDesktopUrl(res.data.data.url);
      toast.success('Banner image uploaded successfully!');
    } catch {
      toast.error('Failed to upload banner image');
    } finally {
      setUploadingDesktop(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badgeText: badgeText.trim() || null,
        imageDesktopUrl: imageDesktopUrl.trim(),
        imageMobileUrl: imageMobileUrl.trim() || imageDesktopUrl.trim() || null,
        ctaText: ctaText.trim() || null,
        ctaLink: ctaLink.trim() || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive,
      };

      if (isEditing && bannerToEdit) {
        return promotionsApi.updateBanner(bannerToEdit.id, payload);
      }
      return promotionsApi.createBanner(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Hero banner updated' : 'Hero banner created');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['public-banners'] });
      onClose();
    },
    onError: (err) => {
      let msg = 'Failed to save hero banner';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageDesktopUrl.trim()) {
      toast.error('Title and Desktop Image URL are required');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF8C00]">
            <ImageIcon className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Hero Banner' : 'Create Hero Banner'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            Configure homepage slider banners, CTAs, and background images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Banner Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Footwear Drop 2026"
              className="border-gray-200 focus:border-[#FF8C00]"
            />
          </div>

          {/* Subtitle & Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Subtitle / Tagline</Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Up to 50% Off Selected Styles"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Badge Text</Label>
              <Input
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. LIMITED TIME"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>
          </div>

          {/* Image Upload / URL */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Desktop Image URL <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={imageDesktopUrl}
                onChange={(e) => setImageDesktopUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="border-gray-200 focus:border-[#FF8C00] text-xs font-mono"
              />
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <div className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 transition-colors">
                  {uploadingDesktop ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#FF8C00]" />
                  )}
                  Upload
                </div>
              </label>
            </div>

            {/* Live Preview Thumbnail */}
            {imageDesktopUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mt-2">
                <Image
                  src={imageDesktopUrl}
                  alt="Banner Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-white">
                  {badgeText && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C00] bg-black/60 px-2 py-0.5 rounded w-fit mb-1">
                      {badgeText}
                    </span>
                  )}
                  <h4 className="text-sm font-bold truncate">{title || 'Untitled Banner'}</h4>
                  {subtitle && <p className="text-[11px] text-gray-200 truncate">{subtitle}</p>}
                </div>
              </div>
            )}
          </div>

          {/* CTA Text & Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Button Text</Label>
              <Input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Shop Collection"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Button Link URL</Label>
              <Input
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="e.g. /collections/summer"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
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
              disabled={mutation.isPending || uploadingDesktop}
              className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-6 shadow-md shadow-[#FF8C00]/20"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Banner'
              ) : (
                'Create Banner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
