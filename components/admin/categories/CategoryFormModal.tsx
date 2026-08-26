'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Link as LinkIcon,
  Upload,
  Tag,
  X,
  ImageOff,
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

import { categorySchema, type CategoryFormInput } from '@/validations/category';
import { categoriesApi } from '@/lib/api/categories';
import type { CategoryDto } from '@/types/category';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: CategoryDto | null;
}

type ImageTab = 'url' | 'upload';

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const CategoryFormModal = ({ open, onOpenChange, editTarget }: CategoryFormModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!editTarget;

  // ─── Image upload state ──────────────────────────────────────
  const [imageTab, setImageTab] = useState<ImageTab>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema) as import('react-hook-form').Resolver<CategoryFormInput>,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
      parentId: null,
    },
  });

  // ─── Populate form when editing ──────────────────────────────
  useEffect(() => {
    if (open && editTarget) {
      reset({
        name: editTarget.name,
        slug: editTarget.slug,
        description: editTarget.description ?? '',
        imageUrl: editTarget.imageUrl ?? '',
        sortOrder: editTarget.sortOrder,
        isActive: editTarget.isActive,
        parentId: editTarget.parentId ?? null,
      });
      setUploadedPreview(editTarget.imageUrl ?? null);
      setUploadedFile(null);
      setImageTab(editTarget.imageUrl ? 'url' : 'upload');
    } else if (open && !editTarget) {
      reset({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        sortOrder: 0,
        isActive: true,
        parentId: null,
      });
      setUploadedPreview(null);
      setUploadedFile(null);
      setImageTab('upload');
    }
  }, [open, editTarget, reset]);

  // ─── Auto-generate slug from name (create only) ──────────────
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', generateSlug(nameValue ?? ''), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const isActiveValue = watch('isActive');
  const imageUrlValue = watch('imageUrl');

  // ─── Resolved preview — file takes precedence ────────────────
  const previewSrc = uploadedPreview ?? (imageUrlValue || null);

  // ─── Handle local file selection ─────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedPreview(objectUrl);
    // Clear URL field when a file is selected
    setValue('imageUrl', '');
  };

  const clearImage = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Upload file to backend, returns URL ─────────────────────
  const uploadFileAndGetUrl = async (): Promise<string | null> => {
    if (!uploadedFile) return imageUrlValue || null;
    setIsUploading(true);
    try {
      const res = await categoriesApi.uploadImage(uploadedFile);
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

  // ─── Create mutation ─────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormInput) => {
      const finalImageUrl = await uploadFileAndGetUrl();
      return categoriesApi.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: finalImageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
        parentId: data.parentId || null,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Category "${res.data.data.name}" created successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'AUTH_PERMISSION_DENIED' || err.response?.status === 403) {
          toast.error('Permission denied. Make sure you are logged in as an Admin with categories.manage.any permission.');
        } else {
          toast.error(err.response?.data?.error?.message ?? 'Failed to create category.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  // ─── Update mutation ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormInput) => {
      const finalImageUrl = await uploadFileAndGetUrl();
      return categoriesApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imageUrl: finalImageUrl !== undefined ? finalImageUrl : (data.imageUrl || null),
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive,
        parentId: data.parentId || null,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Category "${res.data.data.name}" updated successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'AUTH_PERMISSION_DENIED' || err.response?.status === 403) {
          toast.error('Permission denied. Make sure you are logged in as Admin.');
        } else {
          toast.error(err.response?.data?.error?.message ?? 'Failed to update category.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  const onSubmit = (data: CategoryFormInput) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                {isEdit ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Update category details below.' : 'Fill in details to create a new category.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="category-form">
          <div className="px-6 py-5 space-y-5">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Running Shoes"
                className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-slug"
                placeholder="e.g. running-shoes"
                className="font-mono text-sm bg-gray-50 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                {...register('slug')}
              />
              <p className="text-[11px] text-gray-400">Auto-generated from name. Lowercase, alphanumeric, hyphens only.</p>
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-description" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="cat-description"
                rows={3}
                placeholder="A brief description of this category..."
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 resize-none bg-background"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* ─── Category Image ─────────────────────────────── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Category Image <span className="text-gray-400 font-normal">(optional)</span>
              </Label>

              {/* Tab switcher */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium w-fit">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                    imageTab === 'upload'
                      ? 'bg-[#FF8C00] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-3 h-3" aria-hidden="true" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-gray-200 ${
                    imageTab === 'url'
                      ? 'bg-[#FF8C00] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" aria-hidden="true" />
                  Enter URL
                </button>
              </div>

              {/* Upload from device */}
              {imageTab === 'upload' && (
                <div className="space-y-2">
                  {/* Preview */}
                  {previewSrc ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={previewSrc}
                        alt="Category preview"
                        fill
                        className="object-cover"
                        unoptimized={previewSrc.startsWith('blob:')}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="cat-file-upload"
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FF8C00]/50 hover:bg-[#FFF3E0]/30 transition-colors"
                    >
                      <div className="p-3 rounded-full bg-gray-100 mb-2">
                        <Upload className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</p>
                    </label>
                  )}
                  <input
                    id="cat-file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload category image"
                  />
                  {uploadedFile && (
                    <p className="text-xs text-gray-500 truncate">
                      Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              )}

              {/* URL input */}
              {imageTab === 'url' && (
                <div className="space-y-2">
                  <div className="relative flex items-center gap-2">
                    <div className="absolute left-3 text-gray-400">
                      <LinkIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <Input
                      id="cat-image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="pl-9 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                      {...register('imageUrl')}
                    />
                  </div>
                  {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
                  {/* URL preview */}
                  {imageUrlValue && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={imageUrlValue}
                        alt="URL preview"
                        fill
                        className="object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-black">Active Status</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isActiveValue
                    ? 'Category is visible and assignable to products.'
                    : 'Category is hidden and cannot be assigned.'}
                </p>
              </div>
              <Switch
                id="cat-isActive"
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
              form="category-form"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  {isUploading ? 'Uploading image...' : isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormModal;
