'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Package, Save, ArrowLeft, AlertCircle, Info, Image as ImageIcon,
  CheckCircle2, Loader2, PlusCircle, Trash2, Bold, Italic, List as ListIcon, Code, Eye,
  Star, Sparkles, Tag, Upload, Link as LinkIcon, MoveUp, MoveDown, Palette
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { addProductSchema, type AddProductInput } from '@/validations/product';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { brandsApi } from '@/lib/api/brands';
import { isAxiosError } from 'axios';

interface GalleryItem {
  id: string;
  url: string;
  isPrimary: boolean;
  colorName?: string | null;
  position: number;
}

export default function AddProductForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [prevBasePrice, setPrevBasePrice] = useState<number>(0);
  const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');
  const [colorImageAssignments, setColorImageAssignments] = useState<Record<string, string>>({});

  // ─── Multi-Image Gallery State ────────────────────────────────
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [pastedUrl, setPastedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // ─── Live active categories & brands via React Query ────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoriesApi.listActive().then((r) => r.data.data.items),
    staleTime: 5 * 60 * 1000,
  });
  const liveCategories = categoriesData ?? [];

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => brandsApi.listActive().then((r) => r.data.data.items),
    staleTime: 5 * 60 * 1000,
  });
  const liveBrands = brandsData ?? [];

  // Form initialization
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(addProductSchema) as any,
    defaultValues: {
      status: 'DRAFT',
      gender: 'UNISEX',
      basePrice: 0,
      promoBadge: 'NONE',
      customBadgeText: '',
      isFeatured: false,
      options: [],
      variants: [],
      categories: [],
      images: [],
    }
  });

  const productName = watch('name');
  const basePrice = watch('basePrice') || 0;
  const skuPrefix = watch('skuPrefix') || '';
  const description = watch('description') || '';
  const promoBadge = watch('promoBadge');
  const variants = watch('variants') || [];

  // Track if admin manually overrode the SKU prefix
  const [isSkuPrefixTouched, setIsSkuPrefixTouched] = useState(false);

  // Standard color abbreviation lookup map
  const COLOR_CODE_MAP: Record<string, string> = {
    black: 'BLK',
    white: 'WHT',
    red: 'RED',
    blue: 'BLU',
    green: 'GRN',
    yellow: 'YEL',
    brown: 'BRN',
    grey: 'GRY',
    gray: 'GRY',
    orange: 'ORG',
    purple: 'PRP',
    pink: 'PNK',
    gold: 'GLD',
    silver: 'SLV',
    beige: 'BGE',
    navy: 'NVY',
    olive: 'OLV',
    cognac: 'CGN',
    tan: 'TAN',
    wheat: 'WHT',
    solar: 'SLR',
    electric: 'ELC',
  };

  // Convert option values into compact short SKU codes (e.g. Black -> BLK, 42 -> 42)
  const getCompactOptionCode = (val: string): string => {
    const clean = val.trim();
    if (!clean) return 'DEF';
    if (/^\d+(\.\d+)?$/.test(clean) || clean.length <= 3) {
      return clean.toUpperCase();
    }
    const lower = clean.toLowerCase();
    if (COLOR_CODE_MAP[lower]) return COLOR_CODE_MAP[lower];

    const words = clean.split(/\s+/);
    for (const w of words) {
      const wLower = w.toLowerCase();
      if (COLOR_CODE_MAP[wLower]) return COLOR_CODE_MAP[wLower];
    }
    return clean.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  };

  // Derive suggested SKU Prefix from product name (e.g., Air Monarch IV -> SHZ-AM4)
  const deriveSuggestedSkuPrefix = (name: string): string => {
    if (!name || !name.trim()) return 'SHZ';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return `SHZ-${words[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;
    }
    const letters = words.map(w => {
      const upper = w.toUpperCase();
      if (upper === 'IV') return '4';
      if (upper === 'III') return '3';
      if (upper === 'II') return '2';
      if (upper === 'I') return '1';
      return w.replace(/[^a-zA-Z0-9]/g, '')[0] || '';
    }).join('').toUpperCase();

    return `SHZ-${letters.slice(0, 6)}`;
  };

  // Auto-generate slug and SKU Prefix from name
  useEffect(() => {
    if (productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);

      if (!isSkuPrefixTouched) {
        const suggestedPrefix = deriveSuggestedSkuPrefix(productName);
        setValue('skuPrefix', suggestedPrefix);
      }
    }
  }, [productName, isSkuPrefixTouched, setValue]);

  // Manage option inputs (e.g. Size, Color)
  const [optionInputs, setOptionInputs] = useState<{ name: string; rawValues: string }[]>([
    { name: 'Size', rawValues: '40, 41, 42' },
    { name: 'Color', rawValues: 'Black, White' }
  ]);

  const addOptionField = () => {
    setOptionInputs([...optionInputs, { name: '', rawValues: '' }]);
  };

  const removeOptionField = (index: number) => {
    const updated = [...optionInputs];
    updated.splice(index, 1);
    setOptionInputs(updated);
  };

  const handleOptionChange = (index: number, field: 'name' | 'rawValues', value: string) => {
    const updated = [...optionInputs];
    updated[index][field] = value;
    setOptionInputs(updated);
  };

  // Cartesian product helper for variants matrix
  const cartesianProduct = (arrays: string[][]) => {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(d => curr.map(e => [...d, e]));
    }, [[]] as string[][]);
  };

  // Extract color values list for variant-image mapping
  const colorOption = optionInputs.find(o => o.name.trim().toLowerCase() === 'color' || o.name.trim().toLowerCase() === 'couleur');
  const colorValues = colorOption ? colorOption.rawValues.split(',').map(c => c.trim()).filter(Boolean) : [];

  const handleColorImageAssign = (colorName: string, url: string) => {
    const updatedAssignments = { ...colorImageAssignments, [colorName]: url };
    setColorImageAssignments(updatedAssignments);

    const currentVariants = watch('variants') || [];
    const updatedVariants = currentVariants.map((v: any) => {
      if (v.title.toLowerCase().includes(colorName.toLowerCase())) {
        return { ...v, colorImage: url || null };
      }
      return v;
    });
    setValue('variants', updatedVariants);
  };

  // Generate variants automatically based on option combinations with clean compact SKU synthesis
  useEffect(() => {
    const parsedOptions = optionInputs
      .filter(opt => opt.name.trim() !== '' && opt.rawValues.trim() !== '')
      .map(opt => ({
        name: opt.name.trim(),
        values: opt.rawValues.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '')
      }));

    setValue('options', parsedOptions);

    const effectivePrefix = skuPrefix || deriveSuggestedSkuPrefix(productName);

    if (parsedOptions.length === 0) {
      const currentDefault = variants.find((v: any) => v.title.endsWith('- Default'));
      setValue('variants', [{
        sku: `${effectivePrefix}-DEFAULT`,
        title: `${productName || 'Product'} - Default`,
        stockQuantity: currentDefault ? currentDefault.stockQuantity : 10,
        price: currentDefault && currentDefault.price !== prevBasePrice ? currentDefault.price : basePrice,
        barcode: currentDefault ? currentDefault.barcode : '',
        isActive: currentDefault ? currentDefault.isActive : true,
        colorImage: null,
      }]);
      setPrevBasePrice(basePrice);
      return;
    }

    const valueArrays = parsedOptions.map(opt => opt.values);
    const combinations = cartesianProduct(valueArrays);

    const generatedVariants = combinations.map(combination => {
      const titleSuffix = combination.join(' / ');
      const skuSuffix = combination.map(val => getCompactOptionCode(val)).join('-');
      const variantSku = `${effectivePrefix}-${skuSuffix}`;
      const title = `${productName || 'Product'} - ${titleSuffix}`;

      const existing = variants.find((v: any) => v.title === title || v.sku === variantSku);
      
      if (existing) {
        const inheritedPrice = existing.price === prevBasePrice ? basePrice : existing.price;
        return {
          sku: existing.sku || variantSku,
          title: existing.title,
          stockQuantity: existing.stockQuantity,
          price: inheritedPrice,
          barcode: existing.barcode,
          isActive: existing.isActive,
          colorImage: existing.colorImage || null,
        };
      }

      return {
        sku: variantSku,
        title: title,
        stockQuantity: 10,
        price: basePrice,
        barcode: '',
        isActive: true,
        colorImage: null,
      };
    });

    setValue('variants', generatedVariants);
    setPrevBasePrice(basePrice);
  }, [optionInputs, productName, basePrice, skuPrefix, setValue]);

  const handleVariantFieldChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'stockQuantity' || field === 'price' ? Number(value) : value
    };
    setValue('variants', updated);
  };

  // ─── Multi-Image Upload & Gallery Handlers ──────────────────────
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await productsApi.uploadImage(file);
        const imageUrl = res.data.data.url;

        setGallery(prev => {
          const newItem: GalleryItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: imageUrl,
            isPrimary: prev.length === 0, // first uploaded image is primary by default
            position: prev.length,
          };
          return [...prev, newItem];
        });
      }
      toast.success('Image(s) uploaded successfully!');
    } catch {
      toast.error('Failed to upload image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPastedUrl = () => {
    if (!pastedUrl.trim()) return;
    const url = pastedUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }

    setGallery(prev => {
      const newItem: GalleryItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url,
        isPrimary: prev.length === 0,
        position: prev.length,
      };
      return [...prev, newItem];
    });

    setPastedUrl('');
    toast.success('Image URL added to gallery.');
  };

  const setPrimaryImage = (id: string) => {
    setGallery(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const removeGalleryImage = (id: string) => {
    setGallery(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If we removed the primary image and gallery still has images, make first item primary
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    setGallery(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((img, idx) => ({ ...img, position: idx }));
    });
  };

  // Rich Text helper format inserting
  const insertFormat = (format: 'bold' | 'italic' | 'list' | 'code') => {
    const textarea = document.getElementById('product-description') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let replacement = '';

    switch (format) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'list':
        replacement = `\n- ${selected || 'list item'}`;
        break;
      case 'code':
        replacement = `\`${selected || 'code'}\``;
        break;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue('description', newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const renderDescriptionPreview = () => {
    if (!description) return <p className="text-gray-400 text-xs italic">Nothing to preview yet.</p>;

    const parsed = description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">$1</code>')
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('- ')) {
          return `<li class="ml-4 list-disc text-sm text-gray-700 dark:text-gray-300">${line.slice(2)}</li>`;
        }
        return line ? `<p class="mb-2 text-sm text-gray-700 dark:text-gray-300">${line}</p>` : '<br/>';
      })
      .join('');

    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parsed }} />;
  };

  // ─── Mutation for Product Creation & Cache Invalidation ────────
  const createProductMutation = useMutation({
    mutationFn: async (data: AddProductInput) => {
      // Single Atomic Payload for Batched Backend Creation
      const productPayload = {
        name: data.name,
        slug: data.slug,
        brandId: data.brandId,
        sizeGuideId: data.sizeGuideId || null,
        skuPrefix: data.skuPrefix || null,
        shortDescription: data.shortDescription || null,
        basePrice: data.basePrice.toFixed(2),
        compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toFixed(2) : null,
        description: data.description || null,
        material: data.material || null,
        gender: data.gender,
        status: data.status || 'DRAFT',
        categoryIds: data.categories,
        media: gallery.map((img, idx) => ({
          url: img.url,
          isPrimary: img.isPrimary,
          position: idx,
        })),
        options: data.options.map((opt, i) => ({
          name: opt.name,
          position: i,
          values: opt.values,
        })),
        variants: data.variants.map((v: any) => ({
          sku: v.sku,
          title: v.title,
          stockQuantity: v.stockQuantity ?? 10,
          priceMinor: Math.round((v.price || 0) * 1000),
          barcode: v.barcode || null,
          isActive: v.isActive ?? true,
          optionValues: data.options.flatMap((opt: any) => {
            const matchedVal = opt.values.find((valStr: string) => v.title.includes(valStr));
            return matchedVal ? [{ optionName: opt.name, value: matchedVal }] : [];
          }),
        })),
      };

      const res = await productsApi.createProduct(productPayload);
      return res.data.data;
    },
    onSuccess: () => {
      // Targeted Query Invalidation
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });

      toast.success('Product created successfully!');
      // Immediate Optimistic Navigation Feedback
      router.push('/admin/products');
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const errorMsg = err.response?.data?.error?.message || 'Error occurred during product creation.';
        setServerError(errorMsg);
        toast.error(errorMsg);
      } else {
        setServerError('Network error. Please try again.');
        toast.error('Network error. Please try again.');
      }
    },
  });

  const onSubmit = (data: any) => {
    setServerError(null);
    createProductMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Forms & Matrix) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Server Error Banner */}
          {serverError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{serverError}</p>
            </div>
          )}

          {/* Card 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure core shoe details displayed to buyers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Shoe Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Air Monarch IV"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
                  {...register('name')}
                />
                {errors.name?.message && <p className="text-xs text-red-500 mt-1">{String(errors.name.message)}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</label>
                  <input 
                    type="text" 
                    placeholder="e.g. air-monarch-iv"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] bg-gray-50"
                    {...register('slug')}
                  />
                  {errors.slug?.message && <p className="text-xs text-red-500 mt-1">{String(errors.slug.message)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                    <span>SKU Prefix</span>
                    <span className="text-[10px] text-gray-400 font-normal">Auto-suggested / Overridable</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. NIKE-AM or SHZ-AM4"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
                    {...register('skuPrefix', {
                      onChange: () => setIsSkuPrefixTouched(true)
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Short Description</label>
                <textarea 
                  rows={2}
                  placeholder="A brief 1-2 sentence description of the shoe."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] resize-none"
                  {...register('shortDescription')}
                />
              </div>

              {/* Formatted Rich Description Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Description</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDescriptionTab('write')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-150 ${
                        descriptionTab === 'write' ? 'bg-[#FF8C00] text-white font-semibold' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescriptionTab('preview')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-150 flex items-center gap-1 ${
                        descriptionTab === 'preview' ? 'bg-[#FF8C00] text-white font-semibold' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {descriptionTab === 'write' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-t-lg">
                      <button
                        type="button"
                        title="Bold"
                        onClick={() => insertFormat('bold')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Italic"
                        onClick={() => insertFormat('italic')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Bullet List"
                        onClick={() => insertFormat('list')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <ListIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Code Block"
                        onClick={() => insertFormat('code')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea 
                      id="product-description"
                      rows={5}
                      placeholder="Complete detailed comfort specs, sizing details, and materials..."
                      className="w-full px-3.5 py-2.5 border border-t-0 border-gray-200 rounded-b-lg text-sm focus:outline-none focus:border-[#FF8C00]"
                      {...register('description')}
                    />
                  </div>
                ) : (
                  <div className="w-full min-h-[145px] p-4 border border-gray-200 rounded-lg bg-gray-50/50 overflow-y-auto">
                    {renderDescriptionPreview()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Pricing (No Input Spinners) */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing (TND)</CardTitle>
              <CardDescription>Define base prices and comparison figures in Tunisian Dinar.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Base Price (TND)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-gray-400 text-sm font-semibold pointer-events-none select-none">د.ت</div>
                  <input 
                    type="number" 
                    step="0.001"
                    placeholder="129.990"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('basePrice', { valueAsNumber: true })}
                  />
                </div>
                {errors.basePrice?.message && <p className="text-xs text-red-500 mt-1">{String(errors.basePrice.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Compare At Price (TND)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-gray-400 text-sm font-semibold pointer-events-none select-none">د.ت</div>
                  <input 
                    type="number" 
                    step="0.001"
                    placeholder="150.000"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('compareAtPrice', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Promotional Highlights & Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF8C00]" /> Promotional Highlights & Badges
              </CardTitle>
              <CardDescription>Highlight product promotions, featured badges, and custom tags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Promotional Badge</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                    {...register('promoBadge')}
                  >
                    <option value="NONE">None</option>
                    <option value="FEATURED">⭐ Featured</option>
                    <option value="HOT_DEAL">🔥 Hot Deal</option>
                    <option value="LIMITED_EDITION">💎 Limited Edition</option>
                    <option value="CUSTOM">✏️ Custom Badge</option>
                  </select>
                </div>

                {promoBadge === 'CUSTOM' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Custom Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Handmade, Waterproof"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
                      {...register('customBadgeText')}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Featured Storefront Product</p>
                    <p className="text-[11px] text-gray-500">Pin this product to the main homepage featured grid.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
                <p>
                  Note: Badges like <span className="font-semibold text-black">New Arrival</span> and{' '}
                  <span className="font-semibold text-black">Sale / Discount %</span> are dynamically calculated based on creation date and comparison pricing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Multi-Image Upload & Preview Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#FF8C00]" /> Multi-Image Gallery
                </CardTitle>
                <CardDescription>Upload local files or paste image URLs. Set cover image and positions.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & drop upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-gray-50/50 hover:bg-gray-50 hover:border-[#FF8C00]/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="p-3 bg-[#FFF3E0] text-[#FF8C00] rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {isUploading ? 'Uploading file(s)...' : 'Click or drag multiple image files here'}
                </p>
                <p className="text-[10px] text-gray-400">Supports PNG, JPG, WEBP up to 10MB each</p>
              </div>

              {/* Paste URL input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPastedUrl}
                  className="text-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#FF8C00]" /> Add URL
                </Button>
              </div>

              {/* Visual Gallery Grid Preview */}
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {gallery.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`relative group rounded-lg overflow-hidden border transition-all ${
                        img.isPrimary ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="aspect-square relative bg-gray-100">
                        {/* eslint-disable-next-html-element-suppression */}
                        <img
                          src={img.url}
                          alt={`Product preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                          }}
                        />
                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 bg-[#FF8C00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" /> Primary Cover
                          </span>
                        )}
                      </div>

                      {/* Action overlays */}
                      <div className="p-1.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1">
                        {!img.isPrimary ? (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(img.id)}
                            className="text-[10px] text-gray-600 hover:text-[#FF8C00] font-medium"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#FF8C00] font-bold">Cover Image</span>
                        )}

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                            title="Move Up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'down')}
                            disabled={idx === gallery.length - 1}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                            title="Move Down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(img.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs italic">
                  No images added yet. Upload or paste a URL above.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 5: Dynamic Options Config */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Options</CardTitle>
                <CardDescription>Define customized configurations (like sizes, colors).</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOptionField} className="flex items-center gap-1">
                <PlusCircle className="w-4 h-4 text-[#FF8C00]" /> Add Option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionInputs.map((opt, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Option Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Size, Color"
                        value={opt.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Values (Comma Separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 40, 41, 42 or Black, White"
                        value={opt.rawValues}
                        onChange={(e) => handleOptionChange(index, 'rawValues', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeOptionField(index)}
                    className="mt-6 text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {optionInputs.length === 0 && (
                <div className="text-center py-6 text-gray-400 flex flex-col items-center justify-center gap-1.5">
                  <Info className="w-5 h-5 text-gray-300" />
                  <p className="text-xs">No custom options configured. Product will register with a single Default variant.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 6: Variants matrix & Color-to-Image Simplification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Variants Matrix & Color Image Mapping</span>
              </CardTitle>
              <CardDescription>
                Assign photos per Color option. Changes apply automatically across all size variants for that color.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {/* Grouped Color Image Assignments Panel */}
              {colorValues.length > 0 && (
                <div className="p-4 bg-[#FFF3E0]/30 border-b border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#FF8C00]" />
                      Color Image Assignments ({colorValues.length} Colors Detected)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorValues.map((colorName) => {
                      const assignedUrl = colorImageAssignments[colorName] || '';
                      const primaryCover = gallery.find((g) => g.isPrimary)?.url || gallery[0]?.url;
                      const activeDisplayUrl = assignedUrl || primaryCover;

                      return (
                        <div
                          key={colorName}
                          className="p-3 bg-white rounded-lg border border-gray-200 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-black flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C00] inline-block" />
                              {colorName}
                            </span>
                            <Badge
                              className={`text-[10px] ${
                                assignedUrl ? 'bg-amber-50 text-[#FF8C00] border-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              {assignedUrl ? 'Dedicated Photo' : 'Primary Fallback'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 shrink-0 overflow-hidden relative flex items-center justify-center">
                              {activeDisplayUrl ? (
                                <Image src={activeDisplayUrl} alt={colorName} fill unoptimized className="object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-gray-300" />
                              )}
                            </div>

                            <select
                              value={assignedUrl}
                              onChange={(e) => handleColorImageAssign(colorName, e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] bg-white cursor-pointer"
                            >
                              <option value="">(Fallback: Primary Cover Image)</option>
                              {gallery.map((g, gIdx) => (
                                <option key={g.id} value={g.url}>
                                  Image #{gIdx + 1} {g.isPrimary ? '(Primary Cover)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variants Matrix Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant Name</TableHead>
                      <TableHead className="w-[170px]">SKU Code</TableHead>
                      <TableHead className="w-[100px]">Stock Qty</TableHead>
                      <TableHead className="w-[145px]">Price (TND)</TableHead>
                      <TableHead className="w-[180px]">Assigned Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((v: any, index: number) => {
                      const primaryCover = gallery.find((g) => g.isPrimary)?.url || gallery[0]?.url;
                      const activeImage = v.colorImage || primaryCover;
                      const matchedColor = colorValues.find((c) => v.title.toLowerCase().includes(c.toLowerCase()));

                      return (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-semibold text-black text-xs">{v.title}</TableCell>
                          <TableCell>
                            <input 
                              type="text" 
                              value={v.sku}
                              onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] font-mono"
                            />
                          </TableCell>
                          <TableCell>
                            <input 
                              type="number" 
                              value={v.stockQuantity}
                              onChange={(e) => handleVariantFieldChange(index, 'stockQuantity', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="relative flex items-center">
                              <span className="absolute left-2 text-gray-400 text-[10px] font-semibold pointer-events-none select-none">د.ت</span>
                              <input 
                                type="number" 
                                step="0.001"
                                value={v.price}
                                onChange={(e) => handleVariantFieldChange(index, 'price', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center">
                                {activeImage ? (
                                  <Image src={activeImage} alt={v.title} fill unoptimized className="object-cover" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-[11px] font-medium text-black truncate">
                                  {v.colorImage ? (matchedColor ? `Color (${matchedColor})` : 'Dedicated Image') : 'Primary Cover'}
                                </span>
                                <span className="text-[9px] text-gray-400">
                                  {v.colorImage ? 'Color Group' : 'Fallback Rule'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {variants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-400">
                          Configure options or SKU parameters to view variants.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
                <span>
                  <strong>Color-to-Image Rule:</strong> Selecting a photo for a color automatically applies it to all size variants of that color. Unassigned colors fall back to using the primary product cover image.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Controls) */}
        <div className="space-y-6">
          
          {/* Card 7: Save & Status actions */}
          <Card>
            <CardHeader>
              <CardTitle>Catalog Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Status</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('status')}
                >
                  <option value="DRAFT">Draft (Save & Edit Later)</option>
                  <option value="ACTIVE">Active (Publish Immediately)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 flex flex-col gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
                className="w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center justify-center gap-2 py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering Product...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Product
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Card 8: Categorization & Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Assign matching categories, brands, and target tags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Brand dropdown — live from API via React Query */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Manufacturer Brand</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('brandId')}
                >
                  <option value="">Select a Brand</option>
                  {liveBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.brandId?.message && <p className="text-xs text-red-500 mt-1">{String(errors.brandId.message)}</p>}
              </div>

              {/* Categories check grid — live from API via React Query */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Linked Categories</label>
                <div className="grid grid-cols-1 gap-2 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {liveCategories.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No active categories found. Add categories first.</p>
                  ) : (
                    liveCategories.map(category => (
                      <label key={category.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          value={category.id} 
                          {...register('categories')}
                          className="rounded border-gray-300 text-[#FF8C00] focus:ring-[#FF8C00] h-4 w-4" 
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.categories?.message && <p className="text-xs text-red-500 mt-1">{String(errors.categories.message)}</p>}
              </div>

              {/* Target gender */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gender Segment</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('gender')}
                >
                  <option value="UNISEX">Unisex Segment</option>
                  <option value="MALE">Male Segment</option>
                  <option value="FEMALE">Female Segment</option>
                </select>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Material Specification</label>
                <input 
                  type="text" 
                  placeholder="e.g. Leather, Suede"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
                  {...register('material')}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </form>
    </div>
  );
}
