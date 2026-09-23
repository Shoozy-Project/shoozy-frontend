'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Award,
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
import type { BrandDto } from '@/types/brand';

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: BrandDto | null;
}

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

  // ─── Fetch Products for Multi-select Selector ──────────────

  // ─── Search & Selection Memoization ─────────────────────────

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
        description: editTarget.description ?? '',
        logoUrl: editTarget.logoUrl ?? '',
        isActive: editTarget.isActive,
      });
    } else if (open && !editTarget) {
      reset({
        name: '',
        slug: '',
        description: '',
        logoUrl: '',
        isActive: true,
      });
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

  // ─── Handle File Selection ─────────────────────────────────
  // ─── Create Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: BrandFormInput) =>
      brandsApi.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
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
    mutationFn: (data: BrandFormInput) =>
      brandsApi.update(editTarget!.id, {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
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

  const isPending = createMutation.isPending || updateMutation.isPending;

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
                {isEdit ? 'Update partner brand details.' : 'Fill in partner brand details.'}
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

            {/* Brand Logo URL */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Brand Logo <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <div className="space-y-2">
                <Input
                  id="brand-logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="focus-visible:ring-[#FF8C00] focus-visible:ring-offset-0"
                  {...register('logoUrl')}
                />
                {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
                {logoUrlValue && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={logoUrlValue}
                      alt="Logo preview"
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </div>
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
                  {isEdit ? 'Saving...' : 'Creating...'}
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
