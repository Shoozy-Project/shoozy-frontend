import type { EntityTranslation, TranslationMap } from '@/types/localization';

// ─── Category Types ────────────────────────────────────────────

export interface CategoryDto {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  videoMimeType: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  translations?: TranslationMap<EntityTranslation>;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string;
  sortBy?: 'name' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string | null;
  translations?: TranslationMap<EntityTranslation>;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload> & { removeVideo?: boolean };
