// ─── Brand Types ────────────────────────────────────────────

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Product count returned by backend _count.products */
  _count?: { products: number };
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  productIds?: string[];
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;
