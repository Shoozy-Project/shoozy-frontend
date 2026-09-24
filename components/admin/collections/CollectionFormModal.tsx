'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { ImageDropzone } from '@/components/ui/image-dropzone';

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
  createCollectionSchema,
  type CollectionFormInput,
} from '@/validations/collection';
import { collectionsApi } from '@/lib/api/collections';
import { productsApi, type ProductListDto } from '@/lib/api/products';
import type { CollectionDto } from '@/types/collection';
import { useTranslations } from '@/lib/hooks/use-translations';

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
  const { locale, t } = useTranslations();
  const collectionSchema = useMemo(() => createCollectionSchema(locale), [locale]);
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // â”€â”€â”€ Image & Search State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const initialProductIdsRef = useRef<string[]>([]);
  const imageFileRef = useRef<File | null>(null);
  const {
    data: collectionDetail,
    isLoading: isCollectionDetailLoading,
    isError: isCollectionDetailError,
  } = useQuery({
    queryKey: ['collections', 'detail', editTarget?.id],
    queryFn: () => collectionsApi.getById(editTarget!.id).then((response) => response.data.data),
    enabled: open && !!editTarget,
  });

  // â”€â”€â”€ Fetch Products for Multi-select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Search & Selection Memoization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionSchema) as import('react-hook-form').Resolver<CollectionFormInput>,
    defaultValues: {
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      descriptionAr: '',
      imageUrl: '',
      isActive: true,
    },
  });

  // â”€â”€â”€ Populate Form on Edit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /* eslint-disable react-hooks/set-state-in-effect -- Opening a remote-backed editor intentionally hydrates its selection state. */
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.translations?.en?.name ?? editTarget.name,
        nameAr: editTarget.translations?.ar?.name ?? '',
        slug: editTarget.slug,
        description: editTarget.translations?.en?.description ?? editTarget.description ?? '',
        descriptionAr: editTarget.translations?.ar?.description ?? '',
        imageUrl: editTarget.imageUrl ?? '',
        isActive: editTarget.isActive,
      });
      initialProductIdsRef.current = [];
      imageFileRef.current = null;
      setSelectedProductIds([]);
      setProductSearch('');
    } else if (open && !editTarget) {
      reset({
        name: '',
        nameAr: '',
        slug: '',
        description: '',
        descriptionAr: '',
        imageUrl: '',
        isActive: true,
      });
      initialProductIdsRef.current = [];
      imageFileRef.current = null;
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
  /* eslint-enable react-hooks/set-state-in-effect */

  // â”€â”€â”€ Auto-generate Slug (create mode only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const nameValue = useWatch({ control, name: 'name' });
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = useWatch({ control, name: 'isActive' });
  const imageUrlValue = useWatch({ control, name: 'imageUrl' });
  const nameArValue = useWatch({ control, name: 'nameAr' });

  const translations = (data: CollectionFormInput, creating: boolean) => {
    const en = { name: data.name.trim(), description: data.description?.trim() || null };
    const arabicName = data.nameAr?.trim();
    if (arabicName) return { en, ar: { name: arabicName, description: data.descriptionAr?.trim() || null } };
    return creating ? undefined : { en };
  };

  // â”€â”€â”€ Image select handler (deferred â€” file is attached at submit time) â”€â”€â”€â”€â”€â”€
  const handleImageSelect = useCallback((file: File | null, previewUrl: string | null) => {
    imageFileRef.current = file;
    // Update the form field so validation & preview stay in sync
    setValue('imageUrl', previewUrl ?? '', { shouldValidate: false, shouldDirty: true });
  }, [setValue]);

  // â”€â”€â”€ Product Selection Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // â”€â”€â”€ Create Mutation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createMutation = useMutation({
    mutationFn: (data: CollectionFormInput) =>
      collectionsApi.create(
        {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          imageUrl: imageFileRef.current ? undefined : (data.imageUrl || null),
          isActive: data.isActive,
          products: toCollectionProducts(selectedProductIds),
          translations: translations(data, true),
        },
        imageFileRef.current ?? undefined,
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(t('admin.collectionCreated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: () => toast.error(t('admin.collectionCreateError')),
  });

  // â”€â”€â”€ Update Mutation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateMutation = useMutation({
    mutationFn: async (data: CollectionFormInput) => {
      const initialProductIds = initialProductIdsRef.current;
      const productsChanged =
        selectedProductIds.length !== initialProductIds.length ||
        selectedProductIds.some((productId, position) => productId !== initialProductIds[position]);

      return collectionsApi.update(
        editTarget!.id,
        {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          imageUrl: imageFileRef.current ? undefined : (data.imageUrl || null),
          isActive: data.isActive,
          translations: translations(data, false),
          ...(productsChanged && { products: toCollectionProducts(selectedProductIds) }),
        },
        imageFileRef.current ?? undefined,
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(t('admin.collectionUpdated', { name: res.data.data.name }));
      onOpenChange(false);
    },
    onError: () => toast.error(t('admin.collectionUpdateError')),
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
                {t(isEdit ? 'admin.editCollection' : 'admin.addProductCollection')}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEdit
                  ? t('admin.updateCollectionDetails')
                  : t('admin.groupCollection')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="collection-form">
          <div className="px-6 py-5 space-y-5">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.localizedCollectionInfo')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="col-name">{t('admin.englishName')} <span className="text-red-500">*</span></Label>
                  <Input id="col-name" lang="en" placeholder="e.g. Summer Vibes 2026" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="col-name-ar">{t('admin.arabicName')}</Label>
                  <Input id="col-name-ar" lang="ar" placeholder="Ù…Ø«Ø§Ù„: Ø£Ø¬ÙˆØ§Ø¡ Ø§Ù„ØµÙŠÙ 2026" {...register('nameAr')} />
                  {errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}
                </div>
                <div className="space-y-1.5" dir="ltr">
                  <Label htmlFor="col-description">{t('admin.englishDescription')}</Label>
                  <textarea id="col-description" lang="en" rows={3} placeholder="Selected footwear for summer..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('description')} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label htmlFor="col-description-ar">{t('admin.arabicDescription')}</Label>
                  <textarea id="col-description-ar" lang="ar" rows={3} placeholder="ØªØ´ÙƒÙŠÙ„Ø© Ø£Ø­Ø°ÙŠØ© Ù…Ø®ØªØ§Ø±Ø© Ù„Ù„ØµÙŠÙ..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('descriptionAr')} />
                  {errors.descriptionAr && <p className="text-xs text-red-500">{errors.descriptionAr.message}</p>}
                </div>
              </div>
              {!nameArValue?.trim() && <p className="mt-3 text-[11px] text-gray-400">{t('admin.arabicOptional')}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="col-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.slug')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="col-slug"
                placeholder="e.g. summer-vibes-2026"
                className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('slug')}
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* Cover / Banner Image */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('admin.bannerImage')} <span className="text-gray-400 font-normal">{t('admin.optional')}</span>
              </Label>

              <ImageDropzone
                value={imageUrlValue || null}
                onSelect={handleImageSelect}
                disabled={isPending}
              />
              {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
            </div>

            {/* Dual-Pane Searchable Product Selector */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#FF8C00]" />
                  {t('admin.assignProducts', { count: selectedProductIds.length })}
                </Label>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    disabled={filteredProducts.length === 0}
                    className="text-[11px] font-medium text-[#FF8C00] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {t('admin.selectAllFiltered', { count: filteredProducts.length })}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={selectedProductIds.length === 0}
                    className="text-[11px] font-medium text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {t('admin.clearSelection')}
                  </button>
                </div>
              </div>

              {/* Embedded Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder={t('admin.searchProductsSku')}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="ps-8 pe-8 text-xs h-8 focus-visible:ring-[#FF8C00]"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Selected Products Chips View */}
              {selectedProducts.length > 0 && (
                <div className="p-2 bg-[#FFF3E0]/40 border border-[#FF8C00]/20 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#FF8C00] font-semibold">
                    <span>{t('admin.selectedProducts', { count: selectedProducts.length })}</span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-gray-400 hover:text-red-500 text-[10px]"
                    >
                      {t('admin.removeAll')}
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
                  {t('admin.membershipLoadError')}
                </p>
              )}
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-2xs">
                {isMembershipLoading || isProductsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                    <span>{t(isMembershipLoading ? 'admin.loadingMembership' : 'admin.loadingProductsCatalog')}</span>
                  </div>
                ) : isProductsError ? (
                  <div className="py-8 text-center text-xs text-red-500">
                    {t('admin.productsDialogLoadError')}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    {t(productSearch.trim() ? 'admin.noProductMatches' : 'admin.noProductsAvailable')}
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

                        <div className="text-end shrink-0 ms-2">
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
                <p className="text-sm font-medium text-black">{t('admin.activeStatus')}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isActiveValue
                    ? t('admin.collectionActiveCopy')
                    : t('admin.collectionInactiveCopy')}
                </p>
              </div>
              <Switch
                id="col-isActive"
                checked={isActiveValue}
                onCheckedChange={(val) => setValue('isActive', val)}
                className="data-[state=checked]:bg-[#FF8C00]"
                aria-label={t('admin.toggleActiveStatus')}
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
              {t('common.cancel')}
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
                  {t(isEdit ? 'admin.saving' : 'admin.creating')}
                </>
              ) : isEdit ? (
                t('admin.saveChanges')
              ) : (
                t('admin.createCollection')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionFormModal;
