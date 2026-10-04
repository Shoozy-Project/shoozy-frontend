'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { 
  Package, Plus, Search, Eye, Edit, Trash2, Loader2, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { productsApi, type ProductListDto } from '@/lib/api/products';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import type { PaginatedData } from '@/types/api';
import { useTranslations } from '@/lib/hooks/use-translations';

const DeleteProductDialog = dynamic(() => import('./DeleteProductDialog'), { ssr: false });
const ProductPreviewModal = dynamic(() => import('./ProductPreviewModal'), { ssr: false });

export default function ProductsClient() {
  const { locale, t } = useTranslations();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<ProductListDto | null>(null);
  const [previewTarget, setPreviewTarget] = useState<ProductListDto | null>(null);

  // ─── Query 2: Products Directory Table ────────────────────────
  const queryParams = {
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  };

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsApi.list(queryParams).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const products = productsData?.items ?? [];
  const pagination = productsData?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  // ─── Mutation: Status Toggle (ACTIVE <-> DRAFT) ───────────────
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: 'ACTIVE' | 'DRAFT' }) =>
      productsApi.updateStatus(id, nextStatus),

    onMutate: async ({ id, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['products', queryParams] });
      const previousData = queryClient.getQueryData(['products', queryParams]);

      queryClient.setQueryData<PaginatedData<ProductListDto>>(['products', queryParams], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p: ProductListDto) =>
            p.id === id ? { ...p, status: nextStatus } : p
          ),
        };
      });

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['products', queryParams], context.previousData);
      }
      toast.error(t('admin.catalogStatusError'));
    },

    onSuccess: (_, variables) => {
      toast.success(
        variables.nextStatus === 'ACTIVE'
          ? t('admin.productPublished')
          : t('admin.productDrafted')
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const hasActiveFilters = debouncedSearch !== '' || statusFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF8C00]" /> {t('admin.productsCatalog')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.productsCatalogCopy')}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2 cursor-pointer font-medium">
            <Plus className="w-4 h-4" /> {t('admin.addProduct')}
          </Button>
        </Link>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('admin.shoesDirectory')}</CardTitle>
            <CardDescription>{t('admin.shoesDirectoryCopy')}</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                  placeholder={t('admin.searchProduct')}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="w-full ps-9 pe-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
              >
                <option value="ALL">{t('admin.allStatuses')}</option>
                <option value="ACTIVE">{t('admin.publishedActive')}</option>
                <option value="DRAFT">{t('admin.draft')}</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>{t('admin.shoeName')}</TableHead>
                  <TableHead>{t('admin.skuPrefix')}</TableHead>
                  <TableHead>{t('admin.priceTnd')}</TableHead>
                  <TableHead>{t('admin.tableStatus')}</TableHead>
                  <TableHead>{t('admin.updated')}</TableHead>
                  <TableHead className="text-end">{t('admin.tableActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FF8C00]" />
                        <span className="text-sm">{t('admin.loadingCatalog')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {isError && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-red-500">
                      {t('admin.productsLoadError')}
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !isError && products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Package className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">{t('admin.noProducts')}</p>
                        <p className="text-xs text-gray-400">
                          {t(hasActiveFilters ? 'admin.adjustProductFilters' : 'admin.createFirstProduct')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !isError && products.map((p, idx) => {
                  const isDiscounted = p.compareAtPrice && Number(p.compareAtPrice) > Number(p.basePrice);
                  const discountPercent = isDiscounted
                    ? Math.round(((Number(p.compareAtPrice) - Number(p.basePrice)) / Number(p.compareAtPrice)) * 100)
                    : null;

                  return (
                    <TableRow key={p.id} className="hover:bg-gray-50/80">
                      {/* Row Index */}
                      <TableCell className="text-center font-medium text-gray-500 text-xs">
                        {(page - 1) * limit + idx + 1}
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {discountPercent && (
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                -{discountPercent}% {t('admin.off')}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell className="font-mono text-xs text-gray-600 font-medium">
                        {p.skuPrefix || t('admin.notApplicable')}
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{p.basePrice} TND</p>
                          {p.compareAtPrice && (
                            <p className="text-[10px] text-gray-400 line-through">{p.compareAtPrice} TND</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Catalog Status (Active / Draft) */}
                      <TableCell>
                        <Badge
                          className={
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-300 text-[11px]'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-100 border border-gray-300 text-[11px]'
                          }
                        >
                          {t(`status.${p.status}`)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-gray-500">
                        {new Date(p.updatedAt).toLocaleDateString(locale)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          {/* Customer Preview Modal button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t('admin.storefrontPreview')}
                            onClick={() => setPreviewTarget(p)}
                            className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>

                          {/* Toggle Status Eye button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t(p.status === 'ACTIVE' ? 'admin.revertDraft' : 'admin.publishStore')}
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: p.id,
                                nextStatus: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
                              })
                            }
                            className={`h-8 w-8 p-0 ${
                              p.status === 'ACTIVE' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Edit Product */}
                          <Link href={`/admin/products/new?edit=${p.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600" title={t('admin.editProduct')}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>

                          {/* Delete Product */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
                            className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                            title={t('admin.deleteProduct')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <DataTablePagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={(p: number) => setPage(p)}
              totalItems={pagination.total}
              pageSize={limit}
              onPageSizeChange={() => {}}
              itemLabel={t('admin.products')}
            />
          </div>
        )}
      </Card>

      {/* Delete Dialog Modal */}
      {deleteTarget && (
        <DeleteProductDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          productId={deleteTarget.id}
          productName={deleteTarget.name}
        />
      )}

      {/* Customer Preview Modal */}
      {previewTarget && (
        <ProductPreviewModal
          open={!!previewTarget}
          onOpenChange={(open) => {
            if (!open) setPreviewTarget(null);
          }}
          product={previewTarget}
        />
      )}
    </div>
  );
}
