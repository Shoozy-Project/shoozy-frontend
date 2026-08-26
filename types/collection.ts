// ─── Collection Types ────────────────────────────────────────────

export type CollectionType = 'Seasonal' | 'Thematic' | 'Special Drop' | 'Promotional';

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
  productIds?: string[];
}

export interface CollectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
  sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCollectionPayload {
  name: string;
  slug?: string;
  type?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  productIds?: string[];
}

export type UpdateCollectionPayload = Partial<CreateCollectionPayload>;
