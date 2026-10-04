import type { Pagination } from '@/types/api';

export type HomepageBannerPlacement = 'HERO_SLIDER' | 'TOP_BAR' | 'MIDDLE_BANNER' | 'SIDE_BANNER';

export interface HomepageBannerTranslation {
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaLabel: string | null;
}

export interface HomepageBannerAdminDto {
  id: string;
  placement: HomepageBannerPlacement;
  ctaUrl: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  desktopVideoUrl: string | null;
  desktopVideoMimeType: string | null;
  mobileVideoUrl: string | null;
  mobileVideoMimeType: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  promotionId: string | null;
  createdAt: string;
  updatedAt: string;
  translations: { en?: HomepageBannerTranslation; ar?: HomepageBannerTranslation };
  promotion: { id: string; name: string; code: string | null; isActive: boolean } | null;
}

export interface HomepageBannerPayload {
  placement: HomepageBannerPlacement;
  ctaUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  promotionId: string | null;
  translations: { en: HomepageBannerTranslation; ar?: HomepageBannerTranslation };
}

export interface HomepageBannerUpdatePayload extends HomepageBannerPayload {
  removeDesktopVideo?: boolean;
  removeMobileVideo?: boolean;
}

export interface HomepageBannerDto {
  id: string;
  placement: HomepageBannerPlacement;
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  desktopVideoUrl: string | null;
  desktopVideoMimeType: string | null;
  mobileVideoUrl: string | null;
  mobileVideoMimeType: string | null;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  promotionId: string | null;
}

export interface HomepageBannerList {
  items: HomepageBannerAdminDto[];
  pagination: Pagination;
}
