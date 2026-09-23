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
  Layers,
  FilterX,
  FolderTree,
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
import { collectionsApi } from '@/lib/api/collections';
import type { CollectionDto, CollectionListParams } from '@/types/collection';

const CollectionFormModal = dynamic(() => import('./CollectionFormModal'), { ssr: false });
const DeleteCollectionDialog = dynamic(() => import('./DeleteCollectionDialog'), { ssr: false });

type StatusFilter = 'all' | 'active' | 'inactive';

// Format UUID into a sleek short Collection ID badge string (e.g. COL-8F2B)
const formatCollectionId = (id: string) => {
  const shortHex = id.replace(/-/g, '').slice(0, 4).toUpperCase();
  return `COL-${shortHex}`;
};

// ─── Skeleton Row ────────────────────────────────────────────────
const SkeletonRow = () => (
  <TableRow>
    <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
    <TableCell>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded bg-gray-200 animate-pulse shrink-0" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
    <TableCell><div className="h-4 w-44 bg-gray-100 rounded animate-pulse" /></TableCell>
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

const CollectionsClient = () => {
  const queryClient = useQueryClient();

  // ─── Local State ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rawSearch, setRawSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CollectionDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ─── Debounced Search (300ms) ──────────────────────────────
  const [debouncedSearch] = useDebounce(rawSearch, 300);

  // ─── Query Params ──────────────────────────────────────────
  const queryParams: CollectionListParams = {
    page,
    limit,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(statusFilter === 'active' && { isActive: true }),
    ...(statusFilter === 'inactive' && { isActive: false }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  // ─── Fetch Collections Query ───────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['collections', queryParams],
    queryFn: () => collectionsApi.list(queryParams).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const collections = data?.items ?? [];
  const pagination = data?.pagination;

  // ─── Optimistic Status Toggle Mutation ─────────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      collectionsApi.toggleStatus(id, isActive),

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['collections'] });
      const previousData = queryClient.getQueryData<typeof data>(['collections', queryParams]);

      queryClient.setQueryData(['collections', queryParams], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((col) =>
            col.id === id ? { ...col, isActive } : col
          ),
        };
      });

      return { previousData };
    },

    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Collection activated.' : 'Collection deactivated.');
    },

    onError: (err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['collections', queryParams], context.previousData);
      }
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update status.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // ─── Handlers ──────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((collection: CollectionDto) => {
    setEditTarget(collection);
    setModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((collection: CollectionDto) => {
    setDeleteTarget({ id: collection.id, name: collection.name });
  }, []);

  const handleToggleStatus = useCallback(
    (collection: CollectionDto) => {
      toggleMutation.mutate({ id: collection.id, isActive: !collection.isActive });
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
            <Layers className="w-6 h-6 text-[#FF8C00]" aria-hidden="true" />
            Product Collections
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize products into curated collections.
          </p>
        </div>
        <Button
          id="add-collection-btn"
          onClick={handleOpenAdd}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Collection
        </Button>
      </div>

      {/* ─── Table Section ────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Header Search & Filter */}
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">Collections List</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {pagination ? `${pagination.total} total product collections` : 'View and manage store product collections.'}
              </CardDescription>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="collection-search"
                type="text"
                value={rawSearch}
                onChange={handleSearchChange}
                placeholder="Search collections..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0"
                aria-label="Search collections"
              />
            </div>

            {/* Status Filter */}
            <select
              id="collection-status-filter"
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
                  <TableHead className="w-[120px]">Collection ID</TableHead>
                  <TableHead>Collection Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} />
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <p className="text-sm font-medium">Failed to load collections.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!isLoading && !isError && collections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <FolderTree className="w-6 h-6 text-gray-300" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">No collections found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {hasActiveFilters ? 'Try adjusting search or filter criteria.' : 'Create your first curated collection.'}
                          </p>
                        </div>
                        {!hasActiveFilters && (
                          <Button
                            size="sm"
                            onClick={handleOpenAdd}
                            className="mt-1 bg-[#FF8C00] hover:bg-[#e67e00] text-white"
                          >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Collection
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  collections.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* Collection ID */}
                      <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">
                        {formatCollectionId(c.id)}
                      </TableCell>

                      {/* Name + Cover preview */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {c.imageUrl ? (
                            <div className="w-9 h-9 rounded-md border border-gray-200 overflow-hidden relative shrink-0 bg-gray-100">
                              <CommerceImage
                                src={c.imageUrl}
                                alt={c.name}
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4 text-[#FF8C00]" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-sm text-black block">{c.name}</span>
                            <span className="text-[11px] font-mono text-gray-400 block">{c.slug}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="hidden md:table-cell text-gray-500 max-w-xs truncate text-xs">
                        {c.description ?? '—'}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {c.isActive ? (
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
                            id={`toggle-col-status-${c.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(c)}
                            disabled={toggleMutation.isPending && toggleMutation.variables?.id === c.id}
                            className="h-8 w-8 p-0 hover:bg-amber-50"
                            title={c.isActive ? 'Deactivate collection' : 'Activate collection'}
                          >
                            {toggleMutation.isPending && toggleMutation.variables?.id === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : c.isActive ? (
                              <Eye className="w-4 h-4 text-[#FF8C00]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>

                          {/* Edit */}
                          <Button
                            id={`edit-col-${c.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(c)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title={`Edit ${c.name}`}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>

                          {/* Delete */}
                          <Button
                            id={`delete-col-${c.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(c)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title={`Delete ${c.name}`}
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
              itemLabel="collections"
            />
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ────────────────────────────────────────────── */}
      <CollectionFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTarget(null);
        }}
        editTarget={editTarget}
      />

      {deleteTarget && (
        <DeleteCollectionDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          collectionId={deleteTarget.id}
          collectionName={deleteTarget.name}
        />
      )}
    </div>
  );
};

export default CollectionsClient;
