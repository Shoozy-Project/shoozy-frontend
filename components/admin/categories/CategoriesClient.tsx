'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Grid,
  FilterX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

import dynamic from 'next/dynamic';
import { categoriesApi } from '@/lib/api/categories';
import type { CategoryDto, CategoryListParams } from '@/types/category';

const CategoryFormModal = dynamic(() => import('./CategoryFormModal'), { ssr: false });
const DeleteCategoryDialog = dynamic(() => import('./DeleteCategoryDialog'), { ssr: false });

type StatusFilter = 'all' | 'active' | 'inactive';

// ─── Category Thumbnail Component ───────────────────────────────
const CategoryThumbnail = ({ src, name }: { src: string | null; name: string }) => {
  return <CommerceImage src={src} alt={name} sizes="40px" className="object-cover" />;
};

const SkeletonRow = () => (
  <TableRow>
    <TableCell>
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="space-y-1.5">
        <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
      </div>
    </TableCell>
    <TableCell>
      <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse font-mono" />
    </TableCell>
    <TableCell>
      <div className="h-3.5 w-12 bg-gray-200 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
  </TableRow>
);

// ─── Main Component ──────────────────────────────────────────────
const CategoriesClient = () => {
  const queryClient = useQueryClient();

  // ─── Local UI state ─────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rawSearch, setRawSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ─── Debounced search (300ms) ────────────────────────────────
  const [debouncedSearch] = useDebounce(rawSearch, 300);

  // ─── Build query params ──────────────────────────────────────
  const queryParams: CategoryListParams = {
    page,
    limit,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(statusFilter === 'active' && { isActive: true }),
    ...(statusFilter === 'inactive' && { isActive: false }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  // ─── Fetch categories ────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => categoriesApi.list(queryParams).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 min
    placeholderData: (prev) => prev,
  });

  const categories = data?.items ?? [];
  const pagination = data?.pagination;

  // ─── Toggle status mutation (optimistic UI) ───────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoriesApi.toggleStatus(id, isActive),

    onMutate: async ({ id, isActive }) => {
      // Cancel any in-flight queries for this key
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<typeof data>(['categories', queryParams]);

      // Optimistically update the cache
      queryClient.setQueryData(['categories', queryParams], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((cat) =>
            cat.id === id ? { ...cat, isActive } : cat
          ),
        };
      });

      return { previousData };
    },

    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Category activated.' : 'Category deactivated.');
    },

    onError: (err, _vars, context) => {
      // Roll back optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(['categories', queryParams], context.previousData);
      }
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update status.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // ─── Handlers ────────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((cat: CategoryDto) => {
    setEditTarget(cat);
    setModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((cat: CategoryDto) => {
    setDeleteTarget({ id: cat.id, name: cat.name });
  }, []);

  const handleToggleStatus = useCallback(
    (cat: CategoryDto) => {
      toggleMutation.mutate({ id: cat.id, isActive: !cat.isActive });
    },
    [toggleMutation]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(1);
  };

  const handleClearFilters = () => {
    setRawSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = rawSearch.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#FF8C00]" aria-hidden="true" />
            Product Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize products into categories. Changes apply immediately across product forms.
          </p>
        </div>
        <Button
          id="add-category-btn"
          onClick={handleOpenAdd}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Category
        </Button>
      </div>

      {/* ─── Table Card ────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Card Header: search + filters */}
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">Categories List</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {pagination
                  ? `${pagination.total} total categories`
                  : 'Manage your product categories'}
              </CardDescription>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="category-search"
                type="text"
                value={rawSearch}
                onChange={handleSearchChange}
                placeholder="Search categories..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0"
                aria-label="Search categories"
              />
            </div>

            {/* Status Filter */}
            <select
              id="category-status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-black flex items-center gap-1.5 shrink-0"
                aria-label="Clear all filters"
              >
                <FilterX className="w-4 h-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-[60px] pl-4">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell text-right pr-6">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} />
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <p className="text-sm font-medium">Failed to load categories.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                          className="mt-1"
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!isLoading && !isError && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Grid className="w-6 h-6 text-gray-300" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">No categories found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {hasActiveFilters
                              ? 'Try adjusting your search or filter criteria.'
                              : 'Get started by adding your first category.'}
                          </p>
                        </div>
                        {!hasActiveFilters && (
                          <Button
                            size="sm"
                            onClick={handleOpenAdd}
                            className="mt-1 bg-[#FF8C00] hover:bg-[#e67e00] text-white"
                          >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Category
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <TableCell className="pl-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <CategoryThumbnail src={cat.imageUrl} name={cat.name} />
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="py-3">
                        <p className="font-semibold text-sm text-black">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                            {cat.description}
                          </p>
                        )}
                      </TableCell>

                      {/* Slug */}
                      <TableCell className="hidden sm:table-cell py-3">
                        <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          {cat.slug}
                        </code>
                      </TableCell>

                      {/* Product count */}
                      <TableCell className="hidden md:table-cell py-3 text-right pr-6">
                        <span className="text-sm font-semibold text-black">
                          {cat._count?.products ?? 0}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">items</span>
                      </TableCell>

                      {/* Status badge */}
                      <TableCell className="py-3">
                        {cat.isActive ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle status (Eye / EyeOff) */}
                          <Button
                            id={`toggle-status-${cat.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(cat)}
                            disabled={toggleMutation.isPending && toggleMutation.variables?.id === cat.id}
                            className="h-8 w-8 p-0 hover:bg-amber-50"
                            title={cat.isActive ? 'Deactivate category' : 'Activate category'}
                            aria-label={cat.isActive ? `Deactivate ${cat.name}` : `Activate ${cat.name}`}
                          >
                            {toggleMutation.isPending && toggleMutation.variables?.id === cat.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-hidden="true" />
                            ) : cat.isActive ? (
                              <Eye className="w-4 h-4 text-[#FF8C00]" aria-hidden="true" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            )}
                          </Button>

                          {/* Edit */}
                          <Button
                            id={`edit-category-${cat.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(cat)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title={`Edit ${cat.name}`}
                            aria-label={`Edit ${cat.name}`}
                          >
                            <Edit className="w-4 h-4 text-blue-600" aria-hidden="true" />
                          </Button>

                          {/* Delete */}
                          <Button
                            id={`delete-category-${cat.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(cat)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title={`Delete ${cat.name}`}
                            aria-label={`Delete ${cat.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* ─── Reusable Table Pagination ────────────────────────────── */}
          {pagination && (
            <DataTablePagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              itemLabel="categories"
            />
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ───────────────────────────────────────────── */}
      <CategoryFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTarget(null);
        }}
        editTarget={editTarget}
      />

      {deleteTarget && (
        <DeleteCategoryDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          categoryId={deleteTarget.id}
          categoryName={deleteTarget.name}
        />
      )}
    </div>
  );
};

export default CategoriesClient;
