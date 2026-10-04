import type { CatalogCollectionDto } from '@/types/commerce';

const IMAGES = {
  hero1: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1920&q=80',
  hero2: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1920&q=80',
  hero3: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80',
};

export const mockCollections: CatalogCollectionDto[] = [
  {
    id: 'col-1',
    name: 'Exclusive Summer Privilege',
    slug: 'exclusive-summer-privilege',
    description: 'A curated selection of breathable, elegant footwear designed for the most discerning summer wanderer.',
    imageUrl: IMAGES.hero1,
    videoUrl: null,
    videoMimeType: null,
    productCount: 0,
    isActive: true,
    startsAt: '2026-05-01T00:00:00Z',
    endsAt: '2026-08-31T23:59:59Z',
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'col-2',
    name: 'Autumn Classics',
    slug: 'autumn-classics',
    description: 'Timeless silhouettes cast in warm, rich earthy tones for the crisp transition of seasons.',
    imageUrl: IMAGES.hero2,
    videoUrl: null,
    videoMimeType: null,
    productCount: 0,
    isActive: true,
    startsAt: '2026-09-01T00:00:00Z',
    endsAt: null,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'col-3',
    name: 'Limited Artisan Series',
    slug: 'limited-artisan-series',
    description: 'Hand-stitched masterpieces from our master cobblers in Florence. Strictly limited to 100 pairs worldwide.',
    imageUrl: IMAGES.hero3,
    videoUrl: null,
    videoMimeType: null,
    productCount: 0,
    isActive: true,
    startsAt: '2026-11-01T00:00:00Z',
    endsAt: '2026-11-30T23:59:59Z',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
];

