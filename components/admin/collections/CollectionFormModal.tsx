'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  Layers,
  X,
  Link as LinkIcon,
  Check,
  Package,
  Search,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  collectionSchema,
  COLLECTION_TYPES,
  type CollectionFormInput,
} from '@/validations/collection';
import { collectionsApi } from '@/lib/api/collections';
import { productsApi, type ProductDto } from '@/lib/api/products';
import type { CollectionDto } from '@/types/collection';

interface CollectionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: CollectionDto | null;
}

type ImageTab = 'upload' | 'url';

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const CollectionFormModal = ({
  open,
  onOpenChange,
  editTarget,
}: CollectionFormModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Image & Search State ─────────────────────────────────
  const [imageTab, setImageTab] = useState<ImageTab>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Products for Multi-select ───────────────────────
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'list-all-active-selector'],
    queryFn: () => productsApi.list({ limit: 1000 }).then((r) => r.data.data.items),
    enabled: open,
  });
  const availableProducts = useMemo(() => productsData ?? [], [productsData]);

  // ─── Search & Selection Memoization ─────────────────────────
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return availableProducts;
    return availableProducts.filter((p: ProductDto) => {
      const matchName = p.name?.toLowerCase().includes(query) ?? false;
      const matchSlug = p.slug?.toLowerCase().includes(query) ?? false;
      const matchSku = p.skuPrefix?.toLowerCase().includes(query) ?? false;
      const matchCategory = p.primaryCategory?.name?.toLowerCase().includes(query) ?? false;
      return matchName || matchSlug || matchSku || matchCategory;
    });
  }, [availableProducts, productSearch]);

  const selectedProducts = useMemo(() => {
    const idSet = new Set(selectedProductIds);
    return availableProducts.filter((p) => idSet.has(p.id));
  }, [availableProducts, selectedProductIds]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionSchema) as import('react-hook-form').Resolver<CollectionFormInput>,
    defaultValues: {
      name: '',
      slug: '',
      type: 'Seasonal',
      description: '',
      imageUrl: '',
      isActive: true,
    },
  });

  // ─── Populate Form on Edit ──────────────────────────────────
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.name,
        slug: editTarget.slug,
        type: (editTarget.type as any) ?? 'Seasonal',
        description: editTarget.description ?? '',
        imageUrl: editTarget.imageUrl ?? '',
        isActive: editTarget.isActive,
      });
      setUploadedPreview(editTarget.imageUrl ?? null);
      setUploadedFile(null);
      setImageTab(editTarget.imageUrl ? 'url' : 'upload');
      setSelectedProductIds(editTarget.productIds ?? []);
    } else if (open && !editTarget) {
      reset({
        name: '',
        slug: '',
        type: 'Seasonal',
        description: '',
        imageUrl: '',
        isActive: true,
      });
      setUploadedPreview(null);
      setUploadedFile(null);
      setImageTab('upload');
      setSelectedProductIds([]);
    }
  }, [open, editTarget, reset]);

  // ─── Auto-generate Slug (create mode only) ──────────────────
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = watch('isActive');
  const imageUrlValue = watch('imageUrl');

  const previewSrc = uploadedPreview ?? (imageUrlValue || null);

  // ─── Handle File Selection ─────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedPreview(URL.createObjectURL(file));
    setValue('imageUrl', '');
  };

  const clearImage = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!uploadedFile) return imageUrlValue || null;
    setIsUploading(true);
    try {
      const res = await collectionsApi.uploadImage(uploadedFile);
      return res.data.data.url;
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Image upload failed.');
      } else {
        toast.error('Image upload failed.');
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Product Selection Toggle ──────────────────────────────
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // ─── Create Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: CollectionFormInput) => {
      const finalImageUrl = await uploadFile();
      return collectionsApi.create({
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description || null,
        imageUrl: finalImageUrl || null,
        isActive: data.isActive,
        productIds: selectedProductIds,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`Collection "${res.data.data.name}" created successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to create collection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  // ─── Update Mutation ────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data: CollectionFormInput) => {
      const finalImageUrl = await uploadFile();
      return collectionsApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description || null,
        imageUrl: finalImageUrl !== undefined ? finalImageUrl : (data.imageUrl || null),
        isActive: data.isActive,
        productIds: selectedProductIds,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`Collection "${res.data.data.name}" updated successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update collection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  const onSubmit = (data: CollectionFormInput) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                {isEdit ? 'Edit Product Collection' : 'Add Product Collection'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEdit
                  ? 'Update collection details and assigned products.'
                  : 'Group products into custom thematic or seasonal collections.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="collection-form">
          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="col-name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Collection Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="col-name"
                placeholder="e.g. Summer Vibes 2026"
                className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Slug & Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="col-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="col-slug"
                  placeholder="e.g. summer-vibes-2026"
                  className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                  {...register('slug')}
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label htmlFor="col-type" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Collection Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="col-type"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
                  {...register('type')}
                >
                  {COLLECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="col-description" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="col-description"
                rows={3}
                placeholder="Lightweight and vibrant sneakers for hot weather..."
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 resize-none bg-background"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Cover / Banner Image */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Banner / Cover Image <span className="text-gray-400 font-normal">(optional)</span>
              </Label>

              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium w-fit">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                    imageTab === 'upload' ? 'bg-[#FF8C00] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-gray-200 ${
                    imageTab === 'url' ? 'bg-[#FF8C00] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  Enter URL
                </button>
              </div>

              {imageTab === 'upload' && (
                <div className="space-y-2">
                  {previewSrc ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={previewSrc}
                        alt="Collection cover preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="col-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FF8C00]/50 hover:bg-[#FFF3E0]/30 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <p className="text-xs font-medium text-gray-600">Click to upload cover image</p>
                      <p className="text-[11px] text-gray-400">PNG, JPG, WEBP — max 5MB</p>
                    </label>
                  )}
                  <input
                    id="col-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {imageTab === 'url' && (
                <div className="space-y-2">
                  <Input
                    id="col-image-url"
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                    {...register('imageUrl')}
                  />
                  {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                </div>
              )}
            </div>

            {/* Dual-Pane Searchable Product Selector */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#FF8C00]" />
                  Assign Products ({selectedProductIds.length} selected)
                </Label>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    disabled={filteredProducts.length === 0}
                    className="text-[11px] font-medium text-[#FF8C00] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    Select All Filtered ({filteredProducts.length})
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={selectedProductIds.length === 0}
                    className="text-[11px] font-medium text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Embedded Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search products by name, SKU prefix, or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 text-xs h-8 focus-visible:ring-[#FF8C00]"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Selected Products Chips View */}
              {selectedProducts.length > 0 && (
                <div className="p-2 bg-[#FFF3E0]/40 border border-[#FF8C00]/20 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#FF8C00] font-semibold">
                    <span>Selected Products ({selectedProducts.length})</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-gray-400 hover:text-red-500 text-[10px]"
                    >
                      Remove All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {selectedProducts.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-[#FF8C00]/30 text-xs font-medium text-black shadow-2xs"
                      >
                        <span className="truncate max-w-[150px]">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(p.id)}
                          className="text-gray-400 hover:text-red-500 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Products List */}
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-2xs">
                {isProductsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                    <span>Loading products catalog...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    {productSearch.trim() ? 'No products match your search query.' : 'No active products available.'}
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center justify-between p-2 text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FFF3E0]/70' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-gray-300 text-[#FF8C00] focus:ring-[#FF8C00] cursor-pointer"
                          />
                          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {p.primaryImage?.url ? (
                              <Image src={p.primaryImage.url} alt={p.name} fill unoptimized className="object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-black truncate">{p.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              {p.skuPrefix && <span className="font-mono bg-gray-100 px-1 rounded">{p.skuPrefix}</span>}
                              {p.primaryCategory?.name && <span>{p.primaryCategory.name}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <span className="font-semibold text-gray-900">{p.basePrice} TND</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-black">Active Status</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isActiveValue
                    ? 'Collection is visible on store banners and menus.'
                    : 'Collection is hidden from customer store.'}
                </p>
              </div>
              <Switch
                id="col-isActive"
                checked={isActiveValue}
                onCheckedChange={(val) => setValue('isActive', val)}
                className="data-[state=checked]:bg-[#FF8C00]"
                aria-label="Toggle active status"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3 sticky bottom-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="collection-form"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading ? 'Uploading cover...' : isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Collection'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionFormModal;
