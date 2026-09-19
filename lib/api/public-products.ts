import type { ApiSuccess } from '@/types/api';

// MOCK DATA for now since the backend route is not yet implemented.
export interface PublicProductDto {
  id: string;
  name: string;
  category: string;
  description: string;
  priceMinor: number; // in minor units, e.g. 780000 for 780 TND
  imageUrl: string;
  colors?: string;
}

const MOCK_PRODUCTS: PublicProductDto[] = [
  {
    id: 'prod_1',
    name: 'Moccasin 180',
    category: 'The Emblematic Women',
    description: 'Initial blue calfskin box & coconut calfskin box',
    priceMinor: 780000,
    colors: '30 colors',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIbVgJfJXIdygEb6zPKaiwlqffbPhR7dMomJdteQWZQn-WrtPopJsSZOckU2bIIxY3T4l5gljym6ZPNjMBwmGQitXeaxd3XoKKo_v9iRLRklFmorgFSQG1_EdT8_XQvcQkjA3OVOa27RGA_CCbwYJNfxTItcAVFXZ2FC2yKW9Be2g2YmxsfWV2iiHCy6h1FVhyo4rg3Jw0_SDExRg10ZWeLakhBGoyyI2lZcyq8XHx_ibHFUCu1akT6Q',
  },
  {
    id: 'prod_2',
    name: 'Moccasin 180',
    category: 'The Emblematic Women',
    description: 'Initial blue calfskin box & coconut calfskin box',
    priceMinor: 780000,
    colors: '30 colors',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB16hB2wvi0HNGBaouRIY2sB6zwwrPPxYS5uvQjcQXB2EyRg6LrtfCbeaZjVQoI6MxizMlyCpQwjUaEXdfyMU-f4FJLqwSZO4xpFNtiMKftEgtt_1Vm9MJR49dBPjcRWfaxccg8qhbF02LluqmGn0FVIO5eNt6QU9Y-WdchNoPcWfDyWcR_b1TbM8Pm1u8lVhjGVTikyqGo9PMSVuteMfjgZ-OZWhe-KeWZKqmTg1hWveY9j3aYs0dvQQ',
  },
  {
    id: 'prod_3',
    name: 'Moccasin 180',
    category: 'The Emblematic Women',
    description: 'Initial blue calfskin box & coconut calfskin box',
    priceMinor: 780000,
    colors: '30 colors',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC3ANouBXgXSkE69fNOUm2_KDza_IgIEipC_DnxSWCjlhkcsobuH9nnteixazsN0WJeHCux3uCz39ADj70EBbH4YHPXaAI3A6tYqssjNJNdXAIF1Y2xng4o0bah9QYej88GY4OhJF2VXxJcx3XDOruLuVUgfkxPazNpcG630iVBer2gQ3324bNw0lfPHAw55lTU2QMiqmnAAzKFY2wIVfMkylbBsxz6L1yd236pOL9-9a0gsRkpjGN1w',
  },
];

export const publicProductsApi = {
  listPublicProducts: async (): Promise<{ data: ApiSuccess<PublicProductDto[]> }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      data: {
        success: true,
        data: MOCK_PRODUCTS,
      },
    };
  },
};
