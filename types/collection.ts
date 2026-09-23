// ─── Collection Types ────────────────────────────────────────────

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionProductDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  deletedAt: string | null;
  position: number;
}

export interface CollectionDetailDto extends CollectionDto {
  products: CollectionProductDto[];
}

export interface CollectionProductInput {
  productId: string;
  position: number;
}

export interface CollectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'slug' | 'startsAt' | 'endsAt' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCollectionPayload {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  products?: CollectionProductInput[];
}

export type UpdateCollectionPayload = Partial<CreateCollectionPayload>;
