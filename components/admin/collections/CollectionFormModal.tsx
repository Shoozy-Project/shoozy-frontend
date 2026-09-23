'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Layers,
  X,
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
  type CollectionFormInput,
} from '@/validations/collection';
import { collectionsApi } from '@/lib/api/collections';
import { productsApi, type ProductListDto } from '@/lib/api/products';
import type { CollectionDto } from '@/types/collection';

interface CollectionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: CollectionDto | null;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const toCollectionProducts = (productIds: string[]) =>
  productIds.map((productId, position) => ({ productId, position }));

const PRODUCT_SELECTOR_PAGE_SIZE = 100;

const loadAllProducts = async (): Promise<ProductListDto[]> => {
  const products: ProductListDto[] = [];
  const seenProductIds = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const response = await productsApi.list({ page, limit: PRODUCT_SELECTOR_PAGE_SIZE });
    const data = response.data.data;

    data.items.forEach((product) => {
      if (!seenProductIds.has(product.id)) {
        seenProductIds.add(product.id);
        products.push(product);
      }
    });

    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  return products;
};

const CollectionFormModal = ({
  open,
  onOpenChange,
  editTarget,
}: CollectionFormModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Image & Search State ─────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const initialProductIdsRef = useRef<string[]>([]);

  const {
    data: collectionDetail,
    isLoading: isCollectionDetailLoading,
    isError: isCollectionDetailError,
  } = useQuery({
    queryKey: ['collections', 'detail', editTarget?.id],
    queryFn: () => collectionsApi.getById(editTarget!.id).then((response) => response.data.data),
    enabled: open && !!editTarget,
  });

  // ─── Fetch Products for Multi-select ───────────────────────
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery({
    queryKey: ['products', 'list-all-collection-selector', PRODUCT_SELECTOR_PAGE_SIZE],
    queryFn: loadAllProducts,
    enabled: open,
  });
  const availableProducts = useMemo(() => productsData ?? [], [productsData]);

  // ─── Search & Selection Memoization ─────────────────────────
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return availableProducts;
    return availableProducts.filter((p: ProductListDto) => {
      const matchName = p.name?.toLowerCase().includes(query) ?? false;
      const matchSlug = p.slug?.toLowerCase().includes(query) ?? false;
      const matchSku = p.skuPrefix?.toLowerCase().includes(query) ?? false;
      return matchName || matchSlug || matchSku;
    });
  }, [availableProducts, productSearch]);

  const selectedProducts = useMemo(() => {
    const productsById = new Map(availableProducts.map((product) => [product.id, product]));
    return selectedProductIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is ProductListDto => Boolean(product));
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
        description: editTarget.description ?? '',
        imageUrl: editTarget.imageUrl ?? '',
        isActive: editTarget.isActive,
      });
      initialProductIdsRef.current = [];
      setSelectedProductIds([]);
      setProductSearch('');
    } else if (open && !editTarget) {
      reset({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        isActive: true,
      });
      initialProductIdsRef.current = [];
      setSelectedProductIds([]);
      setProductSearch('');
    }
  }, [open, editTarget, reset]);

  useEffect(() => {
    if (!open || !editTarget || !collectionDetail || collectionDetail.id !== editTarget.id) return;

    const productIds = collectionDetail.products.map((product) => product.id);
    initialProductIdsRef.current = productIds;
    setSelectedProductIds(productIds);
  }, [open, editTarget, collectionDetail]);

  // ─── Auto-generate Slug (create mode only) ──────────────────
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = watch('isActive');
  const imageUrlValue = watch('imageUrl');

  // ─── Handle File Selection ─────────────────────────────────
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
    mutationFn: (data: CollectionFormInput) =>
      collectionsApi.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        products: toCollectionProducts(selectedProductIds),
      }),
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
      const initialProductIds = initialProductIdsRef.current;
      const productsChanged =
        selectedProductIds.length !== initialProductIds.length ||
        selectedProductIds.some((productId, position) => productId !== initialProductIds[position]);

      return collectionsApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        ...(productsChanged && { products: toCollectionProducts(selectedProductIds) }),
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

  const isMembershipLoading = isEdit && isCollectionDetailLoading;
  const isPending = createMutation.isPending || updateMutation.isPending;

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
                  : 'Group products into a curated collection.'}
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

              <div className="space-y-2">
                <Input
                  id="col-image-url"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                  {...register('imageUrl')}
                />
                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                {imageUrlValue && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={imageUrlValue}
                      alt="Collection cover preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
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
                  placeholder="Search products by name or SKU prefix..."
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
              {isCollectionDetailError && (
                <p className="text-xs text-red-500">
                  Collection membership could not be loaded. Close this dialog and try again before saving.
                </p>
              )}
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-2xs">
                {isMembershipLoading || isProductsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                    <span>{isMembershipLoading ? 'Loading collection membership...' : 'Loading products catalog...'}</span>
                  </div>
                ) : isProductsError ? (
                  <div className="py-8 text-center text-xs text-red-500">
                    Products could not be loaded. Close this dialog and try again.
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    {productSearch.trim() ? 'No products match your search query.' : 'No products available.'}
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
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-black truncate">{p.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              {p.skuPrefix && <span className="font-mono bg-gray-100 px-1 rounded">{p.skuPrefix}</span>}
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
              disabled={isPending || isMembershipLoading || isCollectionDetailError || isProductsError}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? 'Saving...' : 'Creating...'}
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
