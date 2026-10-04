import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CollectionDetailDto,
  CollectionDto,
  CollectionListParams,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '@/types/collection';

/**
 * Serialise a collection payload into either a plain object (JSON) or a
 * FormData (multipart/form-data) when an image File is attached.
 *
 * The backend's Multer middleware on POST /admin/collections and
 * PATCH /admin/collections/:id reads the JSON fields from a "data" part
 * and the binary from an "image" part — matching the product editor pattern.
 */
function buildBody(
  data: CreateCollectionPayload | UpdateCollectionPayload,
  imageFile?: File | null,
  videoFile?: File | null,
): CreateCollectionPayload | UpdateCollectionPayload | FormData {
  if (!imageFile && !videoFile) return data;

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) formData.append('image', imageFile);
  if (videoFile) formData.append('video', videoFile);
  return formData;
}

export const collectionsApi = {
  /** GET /admin/collections — paginated list with search/filter */
  list: (params: CollectionListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CollectionDto>>>('/admin/collections', { params }),

  /** GET /admin/collections/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<CollectionDetailDto>>(`/admin/collections/${id}`),

  /**
   * POST /admin/collections
   * Pass `imageFile` to send the cover image as multipart/form-data.
   */
  create: (data: CreateCollectionPayload, imageFile?: File | null, videoFile?: File | null) =>
    apiClient.post<ApiSuccess<CollectionDto>>('/admin/collections', buildBody(data, imageFile, videoFile)),

  /**
   * PATCH /admin/collections/:id
   * Pass `imageFile` to replace the cover image via multipart/form-data.
   */
  update: (id: string, data: UpdateCollectionPayload, imageFile?: File | null, videoFile?: File | null) =>
    apiClient.patch<ApiSuccess<CollectionDto>>(`/admin/collections/${id}`, buildBody(data, imageFile, videoFile)),

  /** DELETE /admin/collections/:id → 204 No Content */
  delete: (id: string) =>
    apiClient.delete(`/admin/collections/${id}`),

  /** PATCH /admin/collections/:id — toggle isActive status */
  toggleStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<CollectionDto>>(`/admin/collections/${id}`, { isActive }),
};

