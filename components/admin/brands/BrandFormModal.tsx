'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Globe,
  Upload,
  Award,
  X,
  Link as LinkIcon,
  Search,
  Package,
  Check,
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

import { brandSchema, type BrandFormInput } from '@/validations/brand';
import { brandsApi } from '@/lib/api/brands';
import { productsApi, type ProductDto } from '@/lib/api/products';
import type { BrandDto } from '@/types/brand';

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: BrandDto | null;
}

type LogoTab = 'upload' | 'url';

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const BrandFormModal = ({ open, onOpenChange, editTarget }: BrandFormModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Logo & Product Selector State ─────────────────────────
  const [logoTab, setLogoTab] = useState<LogoTab>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Products for Multi-select Selector ──────────────
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'list-all-active-brand-selector'],
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

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

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
  } = useForm<BrandFormInput>({
    resolver: zodResolver(brandSchema) as import('react-hook-form').Resolver<BrandFormInput>,
    defaultValues: {
      name: '',
      slug: '',
      website: '',
      description: '',
      logoUrl: '',
      isActive: true,
    },
  });

  // ─── Populate Form on Edit ──────────────────────────────────
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.name,
        slug: editTarget.slug,
        website: editTarget.website ?? '',
        description: editTarget.description ?? '',
        logoUrl: editTarget.logoUrl ?? '',
        isActive: editTarget.isActive,
      });
      setUploadedPreview(editTarget.logoUrl ?? null);
      setUploadedFile(null);
      setLogoTab(editTarget.logoUrl ? 'url' : 'upload');
      setProductSearch('');

      // Preselect products linked to this brand
      productsApi.list({ brandId: editTarget.id, limit: 500 }).then((res) => {
        setSelectedProductIds(res.data.data.items.map((p) => p.id));
      }).catch(() => {});
    } else if (open && !editTarget) {
      reset({
        name: '',
        slug: '',
        website: '',
        description: '',
        logoUrl: '',
        isActive: true,
      });
      setUploadedPreview(null);
      setUploadedFile(null);
      setLogoTab('upload');
      setSelectedProductIds([]);
      setProductSearch('');
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
  const logoUrlValue = watch('logoUrl');

  const previewSrc = uploadedPreview ?? (logoUrlValue || null);

  // ─── Handle File Selection ─────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedPreview(URL.createObjectURL(file));
    setValue('logoUrl', '');
  };

  const clearLogo = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    setValue('logoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLogoFile = async (): Promise<string | null> => {
    if (!uploadedFile) return logoUrlValue || null;
    setIsUploading(true);
    try {
      const res = await brandsApi.uploadLogo(uploadedFile);
      return res.data.data.url;
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Logo upload failed.');
      } else {
        toast.error('Logo upload failed.');
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Create Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: BrandFormInput) => {
      const finalLogoUrl = await uploadLogoFile();
      return brandsApi.create({
        name: data.name,
        slug: data.slug,
        website: data.website || null,
        description: data.description || null,
        logoUrl: finalLogoUrl || null,
        isActive: data.isActive,
        productIds: selectedProductIds,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Brand "${res.data.data.name}" created successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to create brand.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  // ─── Update Mutation ────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data: BrandFormInput) => {
      const finalLogoUrl = await uploadLogoFile();
      return brandsApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        website: data.website || null,
        description: data.description || null,
        logoUrl: finalLogoUrl !== undefined ? finalLogoUrl : (data.logoUrl || null),
        isActive: data.isActive,
        productIds: selectedProductIds,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Brand "${res.data.data.name}" updated successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update brand.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  const onSubmit = (data: BrandFormInput) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                {isEdit ? 'Edit Brand' : 'Add New Partner Brand'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Update partner brand details.' : 'Fill in partner brand details to link products.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="brand-form">
          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="brand-name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand-name"
                placeholder="e.g. Nike"
                className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="brand-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand-slug"
                placeholder="e.g. nike"
                className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('slug')}
              />
              <p className="text-[11px] text-gray-400">Auto-generated from name. Lowercase alphanumeric with hyphens.</p>
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label htmlFor="brand-website" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Website URL <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <Input
                  id="brand-website"
                  type="url"
                  placeholder="https://nike.com"
                  className="pl-9 font-mono text-sm focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                  {...register('website')}
                />
              </div>
              {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
            </div>

            {/* Description / Slogan */}
            <div className="space-y-1.5">
              <Label htmlFor="brand-description" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description / Slogan <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="brand-description"
                rows={3}
                placeholder="Just Do It. Athletic and lifestyle wear."
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 resize-none bg-background"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Brand Logo Upload / URL */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Brand Logo <span className="text-gray-400 font-normal">(optional)</span>
              </Label>

              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium w-fit">
                <button
                  type="button"
                  onClick={() => setLogoTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                    logoTab === 'upload' ? 'bg-[#FF8C00] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-gray-200 ${
                    logoTab === 'url' ? 'bg-[#FF8C00] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  Enter URL
                </button>
              </div>

              {logoTab === 'upload' && (
                <div className="space-y-2">
                  {previewSrc ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
                      <Image
                        src={previewSrc}
                        alt="Logo preview"
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                        aria-label="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="brand-logo-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FF8C00]/50 hover:bg-[#FFF3E0]/30 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <p className="text-xs font-medium text-gray-600">Click to upload brand logo</p>
                      <p className="text-[11px] text-gray-400">PNG, SVG, JPG — max 5MB</p>
                    </label>
                  )}
                  <input
                    id="brand-logo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {logoTab === 'url' && (
                <div className="space-y-2">
                  <Input
                    id="brand-logo-url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                    {...register('logoUrl')}
                  />
                  {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
                </div>
              )}
            </div>

            {/* Dual-Pane Searchable Product Selector */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#FF8C00]" />
                  Link Products ({selectedProductIds.length} selected)
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
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-2xs">
                {isProductsLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                    <span>Loading products catalog...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
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
                          <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {p.primaryImage?.url ? (
                              <Image src={p.primaryImage.url} alt={p.name} fill unoptimized className="object-cover" />
                            ) : (
                              <Package className="w-3.5 h-3.5 text-gray-300" />
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
                    ? 'Brand is active and visible in product catalog.'
                    : 'Brand is inactive and hidden from filters.'}
                </p>
              </div>
              <Switch
                id="brand-isActive"
                checked={isActiveValue}
                onCheckedChange={(val) => setValue('isActive', val)}
                className="data-[state=checked]:bg-[#FF8C00]"
                aria-label="Toggle brand active status"
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
              form="brand-form"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading ? 'Uploading logo...' : isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Brand'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrandFormModal;
