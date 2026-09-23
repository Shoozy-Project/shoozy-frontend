'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Award,
  FilterX,
  Building2,
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
import { brandsApi } from '@/lib/api/brands';
import type { BrandDto, BrandListParams } from '@/types/brand';

const BrandFormModal = dynamic(() => import('./BrandFormModal'), { ssr: false });
const DeleteBrandDialog = dynamic(() => import('./DeleteBrandDialog'), { ssr: false });

type StatusFilter = 'all' | 'active' | 'inactive';

// Format UUID into a sleek short Brand ID badge string (e.g. BRD-8F2B)
const formatBrandId = (id: string) => {
  const shortHex = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `BRD-${shortHex}`;
};

// ─── Skeleton Row ────────────────────────────────────────────────
const SkeletonRow = () => (
  <TableRow>
    <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
    <TableCell>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-gray-200 animate-pulse shrink-0" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
    <TableCell><div className="h-4 w-40 bg-gray-100 rounded animate-pulse" /></TableCell>
    <TableCell><div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" /></TableCell>
    <TableCell>
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
  </TableRow>
);

const BrandsClient = () => {
  const queryClient = useQueryClient();

  // ─── Local State ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rawSearch, setRawSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BrandDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ─── Debounced Search (300ms) ──────────────────────────────
  const [debouncedSearch] = useDebounce(rawSearch, 300);

  // ─── Query Params ──────────────────────────────────────────
  const queryParams: BrandListParams = {
    page,
    limit,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(statusFilter === 'active' && { isActive: true }),
    ...(statusFilter === 'inactive' && { isActive: false }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  // ─── Fetch Brands Query ────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['brands', queryParams],
    queryFn: () => brandsApi.list(queryParams).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const brands = data?.items ?? [];
  const pagination = data?.pagination;

  // ─── Optimistic Status Toggle Mutation ─────────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      brandsApi.toggleStatus(id, isActive),

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['brands'] });
      const previousData = queryClient.getQueryData<typeof data>(['brands', queryParams]);

      queryClient.setQueryData(['brands', queryParams], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((brand) =>
            brand.id === id ? { ...brand, isActive } : brand
          ),
        };
      });

      return { previousData };
    },

    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Brand activated.' : 'Brand deactivated.');
    },

    onError: (err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['brands', queryParams], context.previousData);
      }
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update status.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  // ─── Handlers ──────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((brand: BrandDto) => {
    setEditTarget(brand);
    setModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((brand: BrandDto) => {
    setDeleteTarget({ id: brand.id, name: brand.name });
  }, []);

  const handleToggleStatus = useCallback(
    (brand: BrandDto) => {
      toggleMutation.mutate({ id: brand.id, isActive: !brand.isActive });
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
            <Award className="w-6 h-6 text-[#FF8C00]" aria-hidden="true" />
            Brands Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage partner manufacturers, logos, descriptions, and availability.
          </p>
        </div>
        <Button
          id="add-brand-btn"
          onClick={handleOpenAdd}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Brand
        </Button>
      </div>

      {/* ─── Table Section ────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Header Search & Filter */}
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">Brands List</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {pagination ? `${pagination.total} total partner brands` : 'View and manage all associated partner brands.'}
              </CardDescription>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="brand-search"
                type="text"
                value={rawSearch}
                onChange={handleSearchChange}
                placeholder="Search brands..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0"
                aria-label="Search brands"
              />
            </div>

            {/* Status Filter */}
            <select
              id="brand-status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-black flex items-center gap-1.5 shrink-0"
              >
                <FilterX className="w-4 h-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Data Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-[120px]">Brand ID</TableHead>
                  <TableHead>Brand Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
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
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <p className="text-sm font-medium">Failed to load brands directory.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!isLoading && !isError && brands.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-300" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">No brands found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {hasActiveFilters ? 'Try adjusting search or filter criteria.' : 'Get started by adding your first partner brand.'}
                          </p>
                        </div>
                        {!hasActiveFilters && (
                          <Button
                            size="sm"
                            onClick={handleOpenAdd}
                            className="mt-1 bg-[#FF8C00] hover:bg-[#e67e00] text-white"
                          >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Brand
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  brands.map((b) => (
                    <TableRow key={b.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Brand ID */}
                      <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">
                        {formatBrandId(b.id)}
                      </TableCell>

                      {/* Brand Name + Logo */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {b.logoUrl ? (
                            <div className="w-7 h-7 rounded border border-gray-200 overflow-hidden relative shrink-0 bg-white p-0.5">
                              <Image
                                src={b.logoUrl}
                                alt={b.name}
                                fill
                                unoptimized
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500 uppercase">
                              {b.name[0]}
                            </div>
                          )}
                          <span className="font-semibold text-sm text-black">{b.name}</span>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="hidden md:table-cell text-gray-500 max-w-xs truncate text-xs">
                        {b.description ?? '—'}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {b.isActive ? (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border border-gray-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Status */}
                          <Button
                            id={`toggle-brand-status-${b.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(b)}
                            disabled={toggleMutation.isPending && toggleMutation.variables?.id === b.id}
                            className="h-8 w-8 p-0 hover:bg-amber-50"
                            title={b.isActive ? 'Deactivate brand' : 'Activate brand'}
                          >
                            {toggleMutation.isPending && toggleMutation.variables?.id === b.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : b.isActive ? (
                              <Eye className="w-4 h-4 text-[#FF8C00]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>

                          {/* Edit */}
                          <Button
                            id={`edit-brand-${b.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(b)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title={`Edit ${b.name}`}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>

                          {/* Delete */}
                          <Button
                            id={`delete-brand-${b.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(b)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title={`Delete ${b.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* ─── Pagination ──────────────────────────────────────── */}
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
              itemLabel="brands"
            />
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ────────────────────────────────────────────── */}
      <BrandFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTarget(null);
        }}
        editTarget={editTarget}
      />

      {deleteTarget && (
        <DeleteBrandDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          brandId={deleteTarget.id}
          brandName={deleteTarget.name}
        />
      )}
    </div>
  );
};

export default BrandsClient;
