import apiClient from '@/lib/api/client';
import type { ApiSuccess, Pagination } from '@/types/api';
import type {
  HomepageBannerAdminDto,
  HomepageBannerDto,
  HomepageBannerList,
  HomepageBannerPayload,
  HomepageBannerPlacement,
  HomepageBannerUpdatePayload,
} from '@/types/homepage';

interface HomepageBannerMediaFiles {
  desktopImage?: File | null;
  mobileImage?: File | null;
  desktopVideo?: File | null;
  mobileVideo?: File | null;
}

function body(payload: HomepageBannerPayload | HomepageBannerUpdatePayload, files: HomepageBannerMediaFiles = {}) {
  const { desktopImage, mobileImage, desktopVideo, mobileVideo } = files;
  if (!desktopImage && !mobileImage && !desktopVideo && !mobileVideo) return payload;
  const form = new FormData();
  form.append('data', JSON.stringify(payload));
  if (desktopImage) form.append('desktopImage', desktopImage);
  if (mobileImage) form.append('mobileImage', mobileImage);
  if (desktopVideo) form.append('desktopVideo', desktopVideo);
  if (mobileVideo) form.append('mobileVideo', mobileVideo);
  return form;
}

export const homepageApi = {
  banners: (placement: HomepageBannerPlacement = 'HERO_SLIDER') =>
    apiClient.get<ApiSuccess<HomepageBannerDto[]>>('/homepage/banners', { params: { placement } }),
};

export const homepageAdminApi = {
  async list(params: { page?: number; limit?: number; placement?: HomepageBannerPlacement; isActive?: boolean; search?: string } = {}): Promise<HomepageBannerList> {
    const response = await apiClient.get<ApiSuccess<HomepageBannerAdminDto[]>>('/admin/homepage/banners', { params });
    return { items: response.data.data, pagination: response.data.meta?.pagination as Pagination };
  },
  get: (id: string) => apiClient.get<ApiSuccess<HomepageBannerAdminDto>>(`/admin/homepage/banners/${id}`).then((response) => response.data.data),
  create: (payload: HomepageBannerPayload, files: HomepageBannerMediaFiles = {}) =>
    apiClient.post<ApiSuccess<HomepageBannerAdminDto>>('/admin/homepage/banners', body(payload, files)),
  update: (id: string, payload: HomepageBannerUpdatePayload, files: HomepageBannerMediaFiles = {}) =>
    apiClient.patch<ApiSuccess<HomepageBannerAdminDto>>(`/admin/homepage/banners/${id}`, body(payload, files)),
  delete: (id: string) => apiClient.delete(`/admin/homepage/banners/${id}`),
  toggle: (id: string, active: boolean) => apiClient.patch<ApiSuccess<HomepageBannerAdminDto>>(`/admin/homepage/banners/${id}/${active ? 'activate' : 'deactivate'}`),
};
