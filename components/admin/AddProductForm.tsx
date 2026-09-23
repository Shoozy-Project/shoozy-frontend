'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Save, ArrowLeft, AlertCircle, Info, Image as ImageIcon,
  Loader2, PlusCircle, Trash2, Bold, Italic, List as ListIcon, Code, Eye,
  Star, Upload, Link as LinkIcon, MoveUp, MoveDown, Palette
} from 'lucide-react';
import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createAddProductSchema, type AddProductInput } from '@/validations/product';
import { productsApi } from '@/lib/api/products';
import { majorToMinorString } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

type ProductFormVariant = AddProductInput['variants'][number];

const optionKey = (optionIndex: number) => `option-${optionIndex}`;
const valueKey = (optionIndex: number, valueIndex: number) => `value-${optionIndex}-${valueIndex}`;
const variantKey = (variantIndex: number) => `variant-${variantIndex}`;

const hasSameOptionSelections = (left: Record<string, string>, right: Record<string, string>) => {
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => left[key] === right[key]);
};

interface GalleryItem {
  id: string;
  url: string;
  file?: File;
  existingId?: string;
  variantId?: string | null;
  isPrimary: boolean;
  colorName?: string | null;
  position: number;
}

export default function AddProductForm({ productId }: { productId?: string }) {
  const { locale, t } = useTranslations();
  const productSchema = useMemo(() => createAddProductSchema(locale), [locale]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const prevBasePriceRef = useRef(0);
  const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');
  const [colorImageAssignments, setColorImageAssignments] = useState<Record<string, string>>({});

  // ─── Multi-Image Gallery State ────────────────────────────────
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [pastedUrl, setPastedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const formContextQuery = useQuery({
    queryKey: ['product-form-context'],
    queryFn: () => productsApi.formContext().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
  const formContext = formContextQuery.data;
  const liveCategories = formContext?.categories.filter((category) => category.isActive) ?? [];
  const liveBrands = formContext?.brands ?? [];
  const productDetailQuery = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => productsApi.get(productId!).then((r) => r.data.data),
    enabled: !!productId,
  });
  const productDetail = productDetailQuery.data;

  // Form initialization
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AddProductInput>({
    resolver: zodResolver(productSchema) as Resolver<AddProductInput>,
    defaultValues: {
      status: 'DRAFT',
      gender: 'UNISEX',
      basePrice: 0,
      options: [],
      variants: [],
      categories: [],
      images: [],
    }
  });

  const productName = useWatch({ control, name: 'name' });
  const selectedBrandId = useWatch({ control, name: 'brandId' });
  const basePrice = useWatch({ control, name: 'basePrice' }) || 0;
  const skuPrefix = useWatch({ control, name: 'skuPrefix' }) || '';
  const description = useWatch({ control, name: 'description' }) || '';
  const variants = useWatch({ control, name: 'variants' }) || [];
  const liveSizeGuides = formContext?.sizeGuides.filter(
    (sizeGuide) => !sizeGuide.brandId || sizeGuide.brandId === selectedBrandId
  ) ?? [];

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
    if (productId) return;
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
  }, [productId, productName, isSkuPrefixTouched, setValue]);

  // Manage option inputs (e.g. Size, Color)
  const [optionInputs, setOptionInputs] = useState<{ name: string; nameAr: string; rawValues: string; rawValuesAr: string }[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- The remote product payload hydrates editor-only state after the query resolves. */
  useEffect(() => {
    if (!productDetail) return;
    setOptionInputs(productDetail.options.map((option) => ({
      name: option.translations?.en?.name ?? option.name,
      nameAr: option.translations?.ar?.name ?? '',
      rawValues: option.values.map((value) => value.value).join(', '),
      rawValuesAr: option.values.map((value) => value.translations?.ar?.displayValue ?? '').join('، '),
    })));
    reset({
      name: productDetail.translations?.en?.name ?? productDetail.name,
      nameAr: productDetail.translations?.ar?.name ?? '',
      slug: productDetail.slug,
      brandId: productDetail.brandId,
      sizeGuideId: productDetail.sizeGuideId,
      skuPrefix: productDetail.skuPrefix,
      shortDescription: productDetail.translations?.en?.shortDescription ?? productDetail.shortDescription,
      shortDescriptionAr: productDetail.translations?.ar?.shortDescription ?? '',
      description: productDetail.translations?.en?.description ?? productDetail.description,
      descriptionAr: productDetail.translations?.ar?.description ?? '',
      basePrice: Number(productDetail.basePrice),
      compareAtPrice: productDetail.compareAtPrice ? Number(productDetail.compareAtPrice) : null,
      material: productDetail.translations?.en?.material ?? productDetail.material,
      materialAr: productDetail.translations?.ar?.material ?? '',
      seoTitle: productDetail.translations?.en?.seoTitle ?? productDetail.seoTitle,
      seoTitleAr: productDetail.translations?.ar?.seoTitle ?? '',
      seoDescription: productDetail.translations?.en?.seoDescription ?? productDetail.seoDescription,
      seoDescriptionAr: productDetail.translations?.ar?.seoDescription ?? '',
      gender: productDetail.gender === 'MALE' || productDetail.gender === 'FEMALE'
        ? productDetail.gender
        : 'UNISEX',
      status: productDetail.status,
      categories: productDetail.categories.map((category) => category.id),
      options: productDetail.options.map((option) => ({ name: option.translations?.en?.name ?? option.name, values: option.values.map((value) => value.value) })),
      variants: productDetail.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        stockQuantity: variant.stockQuantity,
        price: Number(variant.priceMinor) / 1000,
        barcode: variant.barcode ?? '',
        isActive: variant.isActive,
        colorImage: null,
        selectedOptionValueKeys: Object.fromEntries(
          variant.optionValues.flatMap((optionValue) => {
            const optionIndex = productDetail.options.findIndex((option) => option.id === optionValue.option.id);
            const valueIndex = productDetail.options[optionIndex]?.values.findIndex((value) => value.id === optionValue.id) ?? -1;
            return optionIndex >= 0 && valueIndex >= 0
              ? [[optionKey(optionIndex), valueKey(optionIndex, valueIndex)] as const]
              : [];
          }),
        ),
      })),
      images: [],
    });
    setGallery(productDetail.media.map((media) => ({
      id: media.id,
      existingId: media.id,
      variantId: media.variantId,
      url: media.url,
      isPrimary: media.isPrimary,
      position: media.position,
    })));
    setIsSkuPrefixTouched(true);
  }, [productDetail, reset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addOptionField = () => {
    setOptionInputs([...optionInputs, { name: '', nameAr: '', rawValues: '', rawValuesAr: '' }]);
  };

  const removeOptionField = (index: number) => {
    const updated = [...optionInputs];
    updated.splice(index, 1);
    setOptionInputs(updated);
  };

  const handleOptionChange = (index: number, field: 'name' | 'nameAr' | 'rawValues' | 'rawValuesAr', value: string) => {
    const updated = [...optionInputs];
    updated[index][field] = value;
    setOptionInputs(updated);
  };

  // Cartesian product helper for variants matrix
  const cartesianProduct = <T,>(arrays: T[][]): T[][] => {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(d => curr.map(e => [...d, e]));
    }, [[]] as T[][]);
  };

  // Extract color values list for variant-image mapping
  const validOptionInputs = optionInputs.filter((option) => option.name.trim() !== '' && option.rawValues.trim() !== '');
  const colorOptionIndex = validOptionInputs.findIndex((option) => {
    const name = option.name.trim().toLowerCase();
    return name === 'color' || name === 'couleur';
  });
  const colorValues = colorOptionIndex >= 0
    ? validOptionInputs[colorOptionIndex].rawValues
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, valueIndex) => ({ name, clientKey: valueKey(colorOptionIndex, valueIndex) }))
    : [];

  const handleColorImageAssign = (colorValueClientKey: string, url: string) => {
    const updatedAssignments = { ...colorImageAssignments, [colorValueClientKey]: url };
    setColorImageAssignments(updatedAssignments);

    const currentVariants = variants;
    const updatedVariants = currentVariants.map((v: ProductFormVariant) => {
      if (v.selectedOptionValueKeys[optionKey(colorOptionIndex)] === colorValueClientKey) {
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
      const currentDefault = variants.find((variant) => Object.keys(variant.selectedOptionValueKeys).length === 0);
      setValue('variants', [{
        sku: `${effectivePrefix}-DEFAULT`,
        title: `${productName || 'Product'} - Default`,
        stockQuantity: currentDefault ? currentDefault.stockQuantity : 0,
        price: currentDefault && currentDefault.price !== prevBasePriceRef.current ? currentDefault.price : basePrice,
        barcode: currentDefault ? currentDefault.barcode : '',
        isActive: currentDefault ? currentDefault.isActive : true,
        colorImage: null,
        selectedOptionValueKeys: {},
      }]);
      prevBasePriceRef.current = basePrice;
      return;
    }

    const valueArrays = parsedOptions.map((option, optionIndex) =>
      option.values.map((value, valueIndex) => ({
        value,
        optionClientKey: optionKey(optionIndex),
        optionValueClientKey: valueKey(optionIndex, valueIndex),
      }))
    );
    const combinations = cartesianProduct(valueArrays);

    const generatedVariants = combinations.map(combination => {
      const selectedOptionValueKeys = Object.fromEntries(
        combination.map((selection) => [selection.optionClientKey, selection.optionValueClientKey])
      );
      const titleSuffix = combination.map((selection) => selection.value).join(' / ');
      const skuSuffix = combination.map((selection) => getCompactOptionCode(selection.value)).join('-');
      const variantSku = `${effectivePrefix}-${skuSuffix}`;
      const title = `${productName || 'Product'} - ${titleSuffix}`;

      const existing = variants.find((variant) =>
        hasSameOptionSelections(variant.selectedOptionValueKeys, selectedOptionValueKeys)
      );
      
      if (existing) {
        const inheritedPrice = existing.price === prevBasePriceRef.current ? basePrice : existing.price;
        return {
          ...existing,
          sku: existing.sku || variantSku,
          title: existing.title,
          stockQuantity: existing.stockQuantity,
          price: inheritedPrice,
          barcode: existing.barcode,
          isActive: existing.isActive,
          colorImage: existing.colorImage || null,
          selectedOptionValueKeys,
        };
      }

      return {
        sku: variantSku,
        title: title,
        stockQuantity: 0,
        price: basePrice,
        barcode: '',
        isActive: true,
        colorImage: null,
        selectedOptionValueKeys,
      };
    });

    setValue('variants', generatedVariants);
    prevBasePriceRef.current = basePrice;
    // Variant rows are the effect output; adding them as a dependency would regenerate indefinitely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionInputs, productName, basePrice, skuPrefix, setValue]);

  const handleVariantFieldChange = (index: number, field: keyof ProductFormVariant, value: unknown) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'stockQuantity' || field === 'price' ? Number(value) : value
    } as ProductFormVariant;
    setValue('variants', updated);
  };

  // ─── Multi-Image Upload & Gallery Handlers ──────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const selected = Array.from(files).slice(0, Math.max(0, 12 - gallery.length));
    setGallery((previous) => [...previous, ...selected.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isPrimary: previous.length === 0 && index === 0,
      position: previous.length + index,
    }))]);
    setIsUploading(false);
    toast.success(t('admin.imageFilesReady', { count: selected.length }));
  };

  const handleAddPastedUrl = () => {
    if (!pastedUrl.trim()) return;
    const url = pastedUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error(t('admin.imageUrlInvalid'));
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
    toast.success(t('admin.imageUrlAdded'));
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
    if (!description) return <p className="text-gray-400 text-xs italic">{t('admin.nothingPreview')}</p>;

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

  // ─── Aggregate Product Save ───────────────────────────────────
  const saveProductMutation = useMutation({
    mutationFn: async (data: AddProductInput) => {
      const fileGallery = gallery.filter((image) => image.file);
      const files = fileGallery.map((image) => image.file!);
      const englishTranslation = {
        name: data.name.trim(),
        shortDescription: data.shortDescription?.trim() || null,
        description: data.description?.trim() || null,
        material: data.material?.trim() || null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
      };
      const arabicName = data.nameAr?.trim();
      const localizedProduct = arabicName ? {
        en: englishTranslation,
        ar: {
          name: arabicName,
          shortDescription: data.shortDescriptionAr?.trim() || null,
          description: data.descriptionAr?.trim() || null,
          material: data.materialAr?.trim() || null,
          seoTitle: data.seoTitleAr?.trim() || null,
          seoDescription: data.seoDescriptionAr?.trim() || null,
        },
      } : (productId ? { en: englishTranslation } : undefined);
      const product = {
        name: data.name,
        slug: data.slug,
        brandId: data.brandId,
        sizeGuideId: data.sizeGuideId || null,
        skuPrefix: data.skuPrefix || null,
        shortDescription: data.shortDescription || null,
        basePrice: data.basePrice.toFixed(2),
        compareAtPrice: data.compareAtPrice != null ? data.compareAtPrice.toFixed(2) : null,
        description: data.description || null,
        material: data.material || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        gender: data.gender,
        status: productId ? data.status : 'DRAFT' as const,
        ...(localizedProduct ? { translations: localizedProduct } : {}),
      };
      const categories = {
        categoryIds: data.categories,
        primaryCategoryId: data.categories[0] ?? null,
      };
      const options = data.options.map((opt, optionIndex) => {
        const optionInput = optionInputs[optionIndex];
        const arabicValues = (optionInput?.rawValuesAr ?? '').split(/[,،]/).map((value) => value.trim());
        const optionNameAr = optionInput?.nameAr.trim();
        return {
          clientKey: optionKey(optionIndex),
          name: opt.name,
          position: optionIndex,
          translations: {
            en: { name: opt.name },
            ...(optionNameAr ? { ar: { name: optionNameAr } } : {}),
          },
          values: opt.values.map((value, valueIndex) => ({
            clientKey: valueKey(optionIndex, valueIndex),
            value,
            displayValue: value,
            position: valueIndex,
            translations: {
              en: { displayValue: value },
              ...(arabicValues[valueIndex] ? { ar: { displayValue: arabicValues[valueIndex] } } : {}),
            },
          })),
        };
      });
      const variantsPayload = data.variants.map((variant, variantIndex) => ({
          clientKey: variantKey(variantIndex),
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          stockQuantity: variant.stockQuantity ?? 0,
          priceMinor: majorToMinorString(String(variant.price || 0), 3),
          barcode: variant.barcode || null,
          isActive: variant.isActive ?? true,
          optionValueClientKeys: Object.values(variant.selectedOptionValueKeys),
        }));
      const newMedia = gallery.filter((image) => !image.existingId).map((image, index) => {
        const matchedVariantIndex = data.variants.findIndex((variant) => variant.colorImage === image.url);
        return {
          ...(image.file ? { fileIndex: fileGallery.findIndex((entry) => entry.id === image.id) } : { url: image.url }),
          ...(matchedVariantIndex >= 0 ? { variantClientKey: variantKey(matchedVariantIndex) } : {}),
          isPrimary: image.isPrimary,
          position: index,
          altText: data.name,
        };
      });

      if (!productId) {
        const response = await productsApi.create({
          product: { ...product, status: 'DRAFT' },
          categories,
          options,
          variants: variantsPayload,
          media: newMedia,
        }, files);
        return response.data.data;
      }

      const existingOptions = productDetail?.options ?? [];
      const retainedOptionIds = new Set<string>();
      const optionUpserts = options.map((option, optionIndex) => {
        const indexedOption = existingOptions[optionIndex];
        const existing = existingOptions.find((candidate) => !retainedOptionIds.has(candidate.id) && candidate.name.toLowerCase() === option.name.toLowerCase())
          ?? (indexedOption && !retainedOptionIds.has(indexedOption.id) ? indexedOption : undefined)
          ?? existingOptions.find((candidate) => !retainedOptionIds.has(candidate.id));
        if (existing) retainedOptionIds.add(existing.id);
        const retainedValueIds = new Set<string>();
        const valueUpserts = option.values.map((value, valueIndex) => {
          const indexedValue = existing?.values[valueIndex];
          const existingValue = existing?.values.find((candidate) => !retainedValueIds.has(candidate.id) && candidate.value === value.value)
            ?? (indexedValue && !retainedValueIds.has(indexedValue.id) ? indexedValue : undefined)
            ?? existing?.values.find((candidate) => !retainedValueIds.has(candidate.id));
          if (existingValue) retainedValueIds.add(existingValue.id);
          return { ...(existingValue ? { id: existingValue.id } : {}), clientKey: value.clientKey, value: value.value, displayValue: value.displayValue, position: value.position, translations: value.translations };
        });
        return {
          ...(existing ? { id: existing.id } : { clientKey: option.clientKey }),
          name: option.name,
          position: option.position,
          translations: option.translations,
          values: {
            upsert: valueUpserts,
            deleteIds: (existing?.values ?? []).filter((value) => !retainedValueIds.has(value.id)).map((value) => value.id),
          },
        };
      });
      const optionDeleteIds = existingOptions.filter((option) => !retainedOptionIds.has(option.id)).map((option) => option.id);
      const deleteMediaIds = (productDetail?.media ?? []).filter((media) => !gallery.some((image) => image.existingId === media.id)).map((media) => media.id);
      const response = await productsApi.update(productId, {
        product,
        categories,
        options: { upsert: optionUpserts, deleteIds: optionDeleteIds },
        variants: {
          upsert: variantsPayload,
          deleteIds: (productDetail?.variants ?? []).filter((variant) => !data.variants.some((current) => current.id === variant.id)).map((variant) => variant.id),
        },
        media: {
          existing: gallery.filter((image) => image.existingId).map((image, index) => ({ id: image.existingId!, variantId: image.variantId ?? null, isPrimary: image.isPrimary, position: index, altText: data.name })),
          new: newMedia,
          deleteIds: deleteMediaIds,
        },
      }, files);
      return response.data.data;
    },
    onSuccess: () => {
      // Targeted Query Invalidation
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      toast.success(t(productId ? 'admin.productUpdatedSuccess' : 'admin.productDraftSuccess'));
      // Immediate Optimistic Navigation Feedback
      router.push('/admin/products');
    },
    onError: () => {
      const errorMessage = t('admin.productSaveError');
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: AddProductInput) => {
    setServerError(null);
    saveProductMutation.mutate(data);
  };

  if (formContextQuery.isPending || (productId && productDetailQuery.isPending)) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" /></div>;
  }
  if (formContextQuery.isError || (productId && productDetailQuery.isError)) {
    return (
      <div className="p-8 rounded-xl border bg-white text-center">
        <p className="text-sm text-red-600">{t('admin.productEditorLoadError')}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => { formContextQuery.refetch(); if (productId) productDetailQuery.refetch(); }}>{t('common.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper Navigation Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('admin.backCatalog')}
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
              <CardTitle>{t('admin.basicInformation')}</CardTitle>
              <CardDescription>{t('admin.basicInformationCopy')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2" dir="ltr">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.englishShoeName')}</label>
                  <input type="text" lang="en" placeholder="e.g. Air Monarch IV" className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('name')} />
                  {errors.name?.message && <p className="mt-1 text-xs text-red-500">{String(errors.name.message)}</p>}
                </div>
                <div className="space-y-2" dir="rtl">
                  <label className="text-xs font-semibold text-gray-500">{t('admin.arabicShoeName')}</label>
                  <input type="text" lang="ar" placeholder="مثال: إير مونارك 4" className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('nameAr')} />
                  {errors.nameAr?.message && <p className="mt-1 text-xs text-red-500">{String(errors.nameAr.message)}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.slug')}</label>
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
                    <span>{t('admin.skuPrefix')}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{t('admin.skuAuto')}</span>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2" dir="ltr">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.englishShortDescription')}</label>
                  <textarea lang="en" rows={2} placeholder="A brief description of the shoe." className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('shortDescription')} />
                </div>
                <div className="space-y-2" dir="rtl">
                  <label className="text-xs font-semibold text-gray-500">{t('admin.arabicShortDescription')}</label>
                  <textarea lang="ar" rows={2} placeholder="وصف مختصر للحذاء." className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('shortDescriptionAr')} />
                </div>
              </div>

              {/* Formatted Rich Description Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.description')}</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDescriptionTab('write')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-150 ${
                        descriptionTab === 'write' ? 'bg-[#FF8C00] text-white font-semibold' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {t('admin.write')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescriptionTab('preview')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-150 flex items-center gap-1 ${
                        descriptionTab === 'preview' ? 'bg-[#FF8C00] text-white font-semibold' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> {t('admin.preview')}
                    </button>
                  </div>
                </div>

                {descriptionTab === 'write' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-t-lg">
                      <button
                        type="button"
                        title={t('admin.bold')}
                        onClick={() => insertFormat('bold')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title={t('admin.italic')}
                        onClick={() => insertFormat('italic')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title={t('admin.bulletList')}
                        onClick={() => insertFormat('list')}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <ListIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title={t('admin.codeBlock')}
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

              <div className="space-y-2" dir="rtl">
                <label className="text-xs font-semibold text-gray-500">{t('admin.detailedArabicDescription')}</label>
                <textarea lang="ar" rows={5} placeholder="تفاصيل الراحة والمقاسات والخامات..." className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('descriptionAr')} />
                {errors.descriptionAr?.message && <p className="text-xs text-red-500">{String(errors.descriptionAr.message)}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Pricing (No Input Spinners) */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.pricingTnd')}</CardTitle>
              <CardDescription>{t('admin.pricingCopy')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.basePriceTnd')}</label>
                <div className="relative flex items-center">
                  <div className="absolute start-3.5 text-gray-400 text-sm font-semibold pointer-events-none select-none">د.ت</div>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="129.99"
                    className="w-full ps-12 pe-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('basePrice', { valueAsNumber: true })}
                  />
                </div>
                {errors.basePrice?.message && <p className="text-xs text-red-500 mt-1">{String(errors.basePrice.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.comparePriceTnd')}</label>
                <div className="relative flex items-center">
                  <div className="absolute start-3.5 text-gray-400 text-sm font-semibold pointer-events-none select-none">د.ت</div>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="150.00"
                    className="w-full ps-12 pe-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    {...register('compareAtPrice', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Image Upload & Preview Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#FF8C00]" /> {t('admin.multiImageGallery')}
                </CardTitle>
                <CardDescription>{t('admin.galleryCopy')}</CardDescription>
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
                  {t(isUploading ? 'admin.uploadingFiles' : 'admin.dropImages')}
                </p>
                <p className="text-[10px] text-gray-400">{t('admin.imageSupport')}</p>
              </div>

              {/* Paste URL input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder={t('admin.pasteImageUrl')}
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPastedUrl}
                  className="text-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#FF8C00]" /> {t('admin.addUrl')}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={t('admin.productPreviewImage', { number: idx + 1 })}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                        {img.isPrimary && (
                          <span className="absolute top-1.5 start-1.5 bg-[#FF8C00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" /> {t('admin.primaryCover')}
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
                            {t('admin.setCover')}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#FF8C00] font-bold">{t('admin.coverImage')}</span>
                        )}

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                            title={t('admin.moveUp')}
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'down')}
                            disabled={idx === gallery.length - 1}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30"
                            title={t('admin.moveDown')}
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(img.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title={t('admin.removeImage')}
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
                  {t('admin.noImages')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 5: Dynamic Options Config */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.productOptions')}</CardTitle>
                <CardDescription>{t('admin.productOptionsCopy')}</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOptionField} className="flex items-center gap-1">
                <PlusCircle className="w-4 h-4 text-[#FF8C00]" /> {t('admin.addOption')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionInputs.map((opt, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in">
                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5" dir="ltr">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('admin.englishOptionName')}</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Size, Color"
                        value={opt.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[10px] font-bold text-gray-400">{t('admin.arabicOptionName')}</label>
                      <input type="text" lang="ar" placeholder="مثال: اللون" value={opt.nameAr} onChange={(e) => handleOptionChange(index, 'nameAr', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#FF8C00] focus:outline-none" />
                    </div>
                    <div className="space-y-1.5" dir="ltr">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('admin.englishValues')}</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 40, 41, 42 or Black, White"
                        value={opt.rawValues}
                        onChange={(e) => handleOptionChange(index, 'rawValues', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[10px] font-bold text-gray-400">{t('admin.arabicValues')}</label>
                      <input type="text" lang="ar" placeholder="مثال: أسود، أبيض — اترك المقاسات الرقمية فارغة" value={opt.rawValuesAr} onChange={(e) => handleOptionChange(index, 'rawValuesAr', e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#FF8C00] focus:outline-none" />
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
                  <p className="text-xs">{t('admin.noCustomOptions')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 6: Variants matrix & Color-to-Image Simplification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('admin.variantsMatrix')}</span>
              </CardTitle>
              <CardDescription>
                {t('admin.variantsMatrixCopy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {/* Grouped Color Image Assignments Panel */}
              {colorValues.length > 0 && (
                <div className="p-4 bg-[#FFF3E0]/30 border-b border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#FF8C00]" />
                      {t('admin.colorAssignments', { count: colorValues.length })}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorValues.map(({ name: colorName, clientKey: colorValueClientKey }) => {
                      const assignedUrl = colorImageAssignments[colorValueClientKey] || '';
                      const primaryCover = gallery.find((g) => g.isPrimary)?.url || gallery[0]?.url;
                      const activeDisplayUrl = assignedUrl || primaryCover;

                      return (
                        <div
                          key={colorValueClientKey}
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
                              {t(assignedUrl ? 'admin.dedicatedPhoto' : 'admin.primaryFallback')}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-gray-200 bg-gray-100 shrink-0 overflow-hidden relative flex items-center justify-center">
                              {activeDisplayUrl ? (
                                <CommerceImage src={activeDisplayUrl} alt={colorName} sizes="40px" className="object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-gray-300" />
                              )}
                            </div>

                            <select
                              value={assignedUrl}
                              onChange={(e) => handleColorImageAssign(colorValueClientKey, e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] bg-white cursor-pointer"
                            >
                              <option value="">{t('admin.fallbackPrimary')}</option>
                              {gallery.map((g, gIdx) => (
                                <option key={g.id} value={g.url}>
                                  {t('admin.imageNumber', { number: gIdx + 1 })} {g.isPrimary ? `(${t('admin.primaryCover')})` : ''}
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
                      <TableHead>{t('admin.variantName')}</TableHead>
                      <TableHead className="w-[170px]">{t('admin.skuCode')}</TableHead>
                      <TableHead className="w-[100px]">{t('admin.stockQuantity')}</TableHead>
                      <TableHead className="w-[145px]">{t('admin.priceTnd')}</TableHead>
                      <TableHead className="w-[180px]">{t('admin.assignedImage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((v, index: number) => {
                      const primaryCover = gallery.find((g) => g.isPrimary)?.url || gallery[0]?.url;
                      const activeImage = v.colorImage || primaryCover;
                      const matchedColor = colorValues.find(
                        (color) => v.selectedOptionValueKeys[optionKey(colorOptionIndex)] === color.clientKey
                      )?.name;

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
                              <span className="absolute start-2 text-gray-400 text-[10px] font-semibold pointer-events-none select-none">د.ت</span>
                              <input 
                                type="number" 
                                step="0.001"
                                value={v.price}
                                onChange={(e) => handleVariantFieldChange(index, 'price', e.target.value)}
                                className="w-full ps-6 pe-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#FF8C00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded border border-gray-200 bg-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center">
                                {activeImage ? (
                                  <CommerceImage src={activeImage} alt={v.title} sizes="28px" className="object-cover" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-[11px] font-medium text-black truncate">
                                  {v.colorImage ? (matchedColor ? t('admin.colorNamed', { name: matchedColor }) : t('admin.dedicatedImage')) : t('admin.primaryCover')}
                                </span>
                                <span className="text-[9px] text-gray-400">
                                  {t(v.colorImage ? 'admin.colorGroup' : 'admin.fallbackRule')}
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
                          {t('admin.configureVariants')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {errors.variants && (
                <p className="px-4 py-2 text-xs text-red-500 border-t border-red-100 bg-red-50/50">
                  {t('admin.variantSelectionError')}
                </p>
              )}

              <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
                <span>
                  <strong>{t('admin.colorImageRule')}</strong> {t('admin.colorImageRuleCopy')}
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
              <CardTitle>{t('admin.catalogStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.publishStatus')}</label>
                <select 
                  disabled={!productId}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('status')}
                >
                  <option value="DRAFT">{t('admin.draftLater')}</option>
                  {productId && <option value="ACTIVE">{t('admin.activeImmediately')}</option>}
                </select>
                {!productId && <p className="text-[11px] text-gray-400">{t('admin.newProductsDraft')}</p>}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 flex flex-col gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={saveProductMutation.isPending}
                className="w-full bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center justify-center gap-2 py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saveProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('admin.savingProduct')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {t('admin.saveProduct')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Card 8: Categorization & Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.organization')}</CardTitle>
              <CardDescription>{t('admin.organizationCopy')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Brand dropdown — live from API via React Query */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.manufacturerBrand')}</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('brandId')}
                >
                  <option value="">{t('admin.selectBrand')}</option>
                  {liveBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.brandId?.message && <p className="text-xs text-red-500 mt-1">{String(errors.brandId.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.sizeGuide')}</label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('sizeGuideId')}
                >
                  <option value="">{t('admin.noSizeGuide')}</option>
                  {liveSizeGuides.map((sizeGuide) => (
                    <option key={sizeGuide.id} value={sizeGuide.id}>{sizeGuide.name}</option>
                  ))}
                </select>
              </div>

              {/* Categories check grid — live from API via React Query */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.linkedCategories')}</label>
                <div className="grid grid-cols-1 gap-2 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {liveCategories.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">{t('admin.noActiveCategories')}</p>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.genderSegment')}</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                  {...register('gender')}
                >
                  <option value="UNISEX">{t('admin.unisexSegment')}</option>
                  <option value="MALE">{t('admin.maleSegment')}</option>
                  <option value="FEMALE">{t('admin.femaleSegment')}</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2" dir="ltr">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.englishMaterial')}</label>
                  <input type="text" lang="en" placeholder="e.g. Leather, Suede" className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('material')} />
                </div>
                <div className="space-y-2" dir="rtl">
                  <label className="text-xs font-semibold text-gray-500">{t('admin.arabicMaterial')}</label>
                  <input type="text" lang="ar" placeholder="مثال: جلد، شمواه" className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#FF8C00] focus:outline-none" {...register('materialAr')} />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.localizedSeo')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2" dir="ltr">
                    <label className="text-xs text-gray-500">{t('admin.englishSeoTitle')}</label>
                    <input type="text" lang="en" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" {...register('seoTitle')} />
                    <textarea lang="en" rows={3} placeholder={t('admin.englishMetaDescription')} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" {...register('seoDescription')} />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-xs text-gray-500">{t('admin.arabicSeoTitle')}</label>
                    <input type="text" lang="ar" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" {...register('seoTitleAr')} />
                    <textarea lang="ar" rows={3} placeholder={t('admin.arabicMetaDescription')} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" {...register('seoDescriptionAr')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </form>
    </div>
  );
}
