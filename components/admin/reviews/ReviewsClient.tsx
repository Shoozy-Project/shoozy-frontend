'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  Star,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  User,
  Package,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { reviewsApi, type ReviewDto, type ReviewStatus } from '@/lib/api/reviews';
import { useDebounce } from 'use-debounce';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function ReviewsClient() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal inspection state
  const [inspectReview, setInspectReview] = useState<ReviewDto | null>(null);

  // Delete dialog state
  const [reviewToDelete, setReviewToDelete] = useState<ReviewDto | null>(null);

  // Fetch reviews using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-reviews', page, pageSize, debouncedSearch, statusFilter],
    queryFn: async () => {
      const res = await reviewsApi.listAdminReviews({
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: statusFilter,
      });
      return res.data.data;
    },
  });

  if (isError) {
    console.error('Error fetching admin reviews:', error);
  }

  const items: ReviewDto[] = data?.items ?? [];
  const pagination = data?.pagination;

  // Status update mutation (Quick Approve / Quick Reject)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      reviewsApi.updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'APPROVED'
          ? 'Review approved & published!'
          : variables.status === 'REJECTED'
          ? 'Review rejected'
          : 'Review status updated to pending'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (err) => {
      let msg = 'Failed to update review status';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setReviewToDelete(null);
    },
    onError: (err) => {
      let msg = 'Failed to delete review';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 text-[10px] font-semibold">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 text-[10px] font-semibold">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#FF8C00]" /> Customer Reviews & Ratings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Moderate verified purchase feedback, approve ratings, and manage customer product reviews.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-100 p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Review Moderation Catalog</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Only approved reviews appear on storefront product pages and influence star ratings.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by customer, product, or comment..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF8C00]"
              />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#FF8C00] text-white shadow-sm shadow-[#FF8C00]/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Reviews' : st}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[110px] text-xs font-bold">Review ID</TableHead>
                  <TableHead className="text-xs font-bold">Customer</TableHead>
                  <TableHead className="text-xs font-bold">Product</TableHead>
                  <TableHead className="text-xs font-bold">Rating</TableHead>
                  <TableHead className="text-xs font-bold">Comment</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold">Date</TableHead>
                  <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Loading customer reviews...</p>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No reviews found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {debouncedSearch || statusFilter !== 'ALL'
                          ? 'Try adjusting your search query or status filter.'
                          : 'Customer product reviews will appear here once submitted.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((rev) => {
                    const shortId = `#REV-${rev.id.slice(0, 4).toUpperCase()}`;
                    const customerName = `${rev.user.firstName} ${rev.user.lastName}`;
                    const productImage = rev.product.media?.[0]?.url;

                    return (
                      <TableRow key={rev.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* ID */}
                        <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">
                          {shortId}
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-gray-900 truncate">{customerName}</p>
                              {rev.user.email && (
                                <p className="text-[11px] text-gray-400 truncate">{rev.user.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Product */}
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-[180px]">
                            {productImage ? (
                              <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0 bg-gray-100">
                                <Image
                                  src={productImage}
                                  alt={rev.product.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <span className="text-xs font-semibold text-gray-800 truncate" title={rev.product.name}>
                              {rev.product.name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Rating */}
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>

                        {/* Comment Snippet */}
                        <TableCell className="max-w-xs">
                          <div className="space-y-0.5">
                            {rev.title && (
                              <p className="text-xs font-bold text-gray-900 truncate">{rev.title}</p>
                            )}
                            <p className="text-xs text-gray-600 truncate italic">
                              "{rev.body || 'No text comment provided'}"
                            </p>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(rev.status)}</TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-gray-500 font-mono">
                          {formatDate(rev.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Inspect Modal Trigger */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectReview(rev)}
                              title="Inspect Full Review"
                              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Quick Approve */}
                            {rev.status !== 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  statusMutation.mutate({ id: rev.id, status: 'APPROVED' })
                                }
                                title="Approve Review"
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Quick Reject */}
                            {rev.status !== 'REJECTED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  statusMutation.mutate({ id: rev.id, status: 'REJECTED' })
                                }
                                title="Reject Review"
                                className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewToDelete(rev)}
                              title="Delete Review"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.total > 0 && (
            <DataTablePagination
              currentPage={pagination.page}
              pageSize={pagination.limit}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Inspect Review Modal */}
      {inspectReview && (
        <Dialog open={!!inspectReview} onOpenChange={(open) => !open && setInspectReview(null)}>
          <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-6">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Review #{inspectReview.id.slice(0, 8)}
                </DialogTitle>
                {getStatusBadge(inspectReview.status)}
              </div>
              <DialogDescription className="text-xs text-gray-500">
                Product: <span className="font-semibold text-gray-800">{inspectReview.product.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Customer & Rating */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {inspectReview.user.firstName} {inspectReview.user.lastName}
                  </p>
                  <p className="text-[11px] text-gray-400">{inspectReview.user.email}</p>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < inspectReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Comment */}
              <div className="space-y-2">
                {inspectReview.title && (
                  <h4 className="text-sm font-bold text-gray-900">{inspectReview.title}</h4>
                )}
                <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-700 leading-relaxed italic border border-gray-100">
                  "{inspectReview.body || 'No text comment provided'}"
                </div>
              </div>

              {/* Moderation Actions Inside Modal */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                {inspectReview.status !== 'APPROVED' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      statusMutation.mutate({ id: inspectReview.id, status: 'APPROVED' });
                      setInspectReview(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4"
                  >
                    Approve & Publish
                  </Button>
                )}

                {inspectReview.status !== 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      statusMutation.mutate({ id: inspectReview.id, status: 'REJECTED' });
                      setInspectReview(null);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert Dialog */}
      {reviewToDelete && (
        <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
          <AlertDialogContent className="bg-white border border-gray-100 shadow-2xl rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">
                Delete Customer Review?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-gray-500">
                This action cannot be undone. This review will be permanently removed from the database and storefront rating totals.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel onClick={() => setReviewToDelete(null)} className="text-xs border-gray-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate(reviewToDelete.id);
                }}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Review'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
