import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type { TranslationMap } from '@/types/localization';

export interface ProductTranslation {
  name: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProductListDto {
  id: string; brandId: string; sizeGuideId: string | null; name: string; slug: string;
  skuPrefix: string | null; shortDescription: string | null; basePrice: string;
  compareAtPrice: string | null; description: string | null; material: string | null;
  gender: string | null; season: string | null; status: 'DRAFT' | 'ACTIVE';
  seoTitle: string | null; seoDescription: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string; deletedAt: string | null;
  translations?: TranslationMap<ProductTranslation>;
}

export interface ProductMediaDto {
  id: string; productId: string; variantId: string | null; type: 'IMAGE' | 'VIDEO';
  mediaType: 'IMAGE' | 'VIDEO'; mimeType: string | null; url: string;
  altText: string | null; position: number; isPrimary: boolean; createdAt: string;
}

export interface ProductOptionValueDto {
  id: string; optionId: string; value: string; displayValue: string | null;
  colorHex: string | null; metadataJson: unknown; position: number;
  translations?: TranslationMap<{ displayValue: string }>;
}

export interface ProductOptionDto {
  id: string; productId: string; name: string; position: number; values: ProductOptionValueDto[];
  translations?: TranslationMap<{ name: string }>;
}

export interface ProductVariantDto {
  id: string; productId: string; sku: string; barcode: string | null; title: string;
  isActive: boolean; stockQuantity: number; weightGrams: number | null; priceMinor: string;
  costMinor: string | null; compareAtPriceMinor: string | null; metadataJson: unknown;
  optionValues: Array<{ id: string; value: string; displayValue: string | null; colorHex: string | null; position: number; option: { id: string; name: string; position: number } }>;
  createdAt: string; updatedAt: string; deletedAt: string | null;
}

export interface ProductDetailDto extends ProductListDto {
  brand: { id: string; name: string; slug: string; isActive: boolean };
  sizeGuide: { id: string; name: string } | null;
  categories: Array<{ id: string; name: string; slug: string; isActive: boolean; isPrimary: boolean }>;
  options: ProductOptionDto[]; variants: ProductVariantDto[]; media: ProductMediaDto[];
}

export interface ProductFormContextDto {
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; parentId: string | null; isActive: boolean }>;
  sizeGuides: Array<{ id: string; name: string; brandId: string | null }>;
}

export interface ProductFields {
  brandId: string; sizeGuideId?: string | null; name: string; slug?: string;
  skuPrefix?: string | null; shortDescription?: string | null; basePrice: string;
  compareAtPrice?: string | null; description?: string | null; material?: string | null;
  gender?: string | null; season?: string | null; status?: 'DRAFT' | 'ACTIVE';
  seoTitle?: string | null; seoDescription?: string | null;
  translations?: TranslationMap<ProductTranslation>;
}

interface NewMediaInput {
  fileIndex?: number; url?: string; variantClientKey?: string | null; variantId?: string | null;
  position?: number; isPrimary?: boolean; altText?: string | null;
}

interface ProductOptionValueUpdateInput {
  id?: string; clientKey?: string; value?: string; displayValue?: string | null;
  colorHex?: string | null; metadataJson?: unknown; position?: number;
  translations?: TranslationMap<{ displayValue: string }>;
}

interface ProductOptionUpdateInput {
  id?: string; clientKey?: string; name?: string; position?: number;
  values?: { upsert: ProductOptionValueUpdateInput[]; deleteIds: string[] };
  translations?: TranslationMap<{ name: string }>;
}

interface ProductVariantUpdateInput {
  id?: string; clientKey?: string; sku?: string; barcode?: string | null; title?: string;
  isActive?: boolean; stockQuantity?: number; weightGrams?: number | null; priceMinor?: string;
  costMinor?: string | null; compareAtPriceMinor?: string | null; metadataJson?: unknown;
  optionValueIds?: string[]; optionValueClientKeys?: string[];
}

export interface ProductEditorCreateInput {
  product: ProductFields & { status?: 'DRAFT' };
  categories?: { categoryIds: string[]; primaryCategoryId: string | null };
  options?: Array<{ clientKey: string; name: string; position?: number; translations?: TranslationMap<{ name: string }>; values: Array<{ clientKey: string; value: string; displayValue?: string | null; colorHex?: string | null; position?: number; translations?: TranslationMap<{ displayValue: string }> }> }>;
  variants?: Array<{ clientKey: string; sku: string; barcode?: string | null; title: string; isActive?: boolean; stockQuantity?: number; weightGrams?: number | null; priceMinor: string; costMinor?: string | null; compareAtPriceMinor?: string | null; optionValueClientKeys: string[] }>;
  media?: NewMediaInput[];
}

export interface ProductEditorUpdateInput {
  product?: Partial<ProductFields>;
  categories?: { categoryIds: string[]; primaryCategoryId: string | null };
  options?: { upsert: ProductOptionUpdateInput[]; deleteIds: string[] };
  variants?: { upsert: ProductVariantUpdateInput[]; deleteIds: string[] };
  media?: { existing: Array<{ id: string; variantId?: string | null; position?: number; isPrimary?: boolean; altText?: string | null }>; new: NewMediaInput[]; deleteIds: string[] };
}

function editorBody(payload: ProductEditorCreateInput | ProductEditorUpdateInput, files: File[]) {
  if (files.length === 0) return payload;
  const formData = new FormData();
  formData.append('data', JSON.stringify(payload));
  files.forEach((file) => formData.append('files[]', file));
  return formData;
}

export const productsApi = {
  list: (params: { page?: number; limit?: number; search?: string; status?: string; categoryId?: string; brandId?: string } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<ProductListDto>>>('/admin/products', { params }),
  get: (productId: string) => apiClient.get<ApiSuccess<ProductDetailDto>>(`/admin/products/${productId}`),
  formContext: () => apiClient.get<ApiSuccess<ProductFormContextDto>>('/admin/products/form-context'),
  create: (payload: ProductEditorCreateInput, files: File[] = []) => apiClient.post<ApiSuccess<ProductDetailDto>>('/admin/products', editorBody(payload, files)),
  update: (productId: string, payload: ProductEditorUpdateInput, files: File[] = []) => apiClient.patch<ApiSuccess<ProductDetailDto>>(`/admin/products/${productId}`, editorBody(payload, files)),
  updateStatus: (productId: string, status: 'DRAFT' | 'ACTIVE') => apiClient.patch<ApiSuccess<ProductListDto>>(`/admin/products/${productId}`, { status }),
  uploadMedia: (productId: string, file: File, mediaType: 'IMAGE' | 'VIDEO', replaceVideo = false) => {
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', mediaType);
    if (mediaType === 'VIDEO') form.append('replaceVideo', String(replaceVideo));
    return apiClient.post<ApiSuccess<ProductMediaDto>>(`/admin/products/${productId}/media/upload`, form);
  },
  deleteMedia: (productId: string, mediaId: string) => apiClient.delete(`/admin/products/${productId}/media/${mediaId}`),
  deleteProduct: (productId: string) => apiClient.delete(`/admin/products/${productId}`),
};
