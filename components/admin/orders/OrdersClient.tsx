'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  Eye,
  RefreshCw,
  Phone,
  FilterX,
  Clock,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import OrderDetailsModal from './OrderDetailsModal';
import { ordersApi, type OrderDto, type OrderStatus } from '@/lib/api/orders';

export default function OrdersClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');

  // Modal State
  const [activeOrder, setActiveOrder] = useState<OrderDto | null>(null);

  // ── Query: List Orders & Stats ──────────────────────────────────────────────
  const queryParams = {
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', queryParams],
    queryFn: () => ordersApi.list(queryParams),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const orders = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = data?.stats ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    returned: 0,
    cancelled: 0,
  };

  // ── Mutation: Quick Status Change (Optimistic UI) ──────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      ordersApi.updateStatus(id, status, note),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousData = queryClient.getQueryData(['orders', queryParams]);

      queryClient.setQueryData(['orders', queryParams], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  paymentStatus: status === 'DELIVERED' ? 'PAID' : o.paymentStatus,
                }
              : o
          ),
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['orders', queryParams], context.previousData);
      }
      toast.error('Failed to update order status.');
    },

    onSuccess: (updatedOrder) => {
      toast.success(`Order ${updatedOrder.orderNumber} set to ${updatedOrder.status}.`);
      if (activeOrder && activeOrder.id === updatedOrder.id) {
        setActiveOrder(updatedOrder);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // ── Mutation: Save Admin Notes ──────────────────────────────────────────────
  const saveNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      ordersApi.saveInternalNotes(id, notes),
    onSuccess: (updatedOrder) => {
      if (activeOrder && activeOrder.id === updatedOrder.id) {
        setActiveOrder(updatedOrder);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleUpdateStatus = async (id: string, status: OrderStatus, note?: string) => {
    await updateStatusMutation.mutateAsync({ id, status, note });
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    await saveNotesMutation.mutateAsync({ id, notes });
  };

  const statusTabs: { id: OrderStatus | 'ALL'; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Orders', count: stats.total },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed },
    { id: 'SHIPPED', label: 'Shipped', count: stats.shipped },
    { id: 'DELIVERED', label: 'Delivered', count: stats.delivered },
    { id: 'RETURNED', label: 'Returned', count: stats.returned },
    { id: 'CANCELLED', label: 'Cancelled', count: stats.cancelled },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-[#FF8C00]" /> Cash on Delivery (COD) Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Verify phone orders, dispatch packages with carriers, and manage COD collection.
          </p>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-[#FF8C00] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-200 shadow-2xs rounded-2xl overflow-hidden bg-white">
        {/* Card Search Header */}
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6 bg-gray-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-black">Order Directory</CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                Showing {pagination.total} total orders
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="order-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by ID, name, or phone..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                />
              </div>

              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchInput('')}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  <FilterX className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Data Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full border-b border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-[120px] pl-6">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Purchased Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading Skeletons */}
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell colSpan={8} className="py-4 text-center">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Empty State */}
                {!isLoading && orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Package className="w-10 h-10 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-700">No orders found.</p>
                        <p className="text-xs text-gray-400">Try clearing search or changing filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Orders List */}
                {!isLoading &&
                  orders.map((order) => {
                    const primaryItem = order.items[0];
                    const extraItemsCount = order.items.length - 1;

                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-orange-50/20 transition-colors duration-150"
                      >
                        {/* Order ID */}
                        <TableCell className="pl-6 font-mono text-xs text-[#FF8C00] font-bold">
                          <button
                            onClick={() => setActiveOrder(order)}
                            className="hover:underline text-left cursor-pointer"
                          >
                            {order.orderNumber}
                          </button>
                        </TableCell>

                        {/* Customer Info */}
                        <TableCell>
                          <div>
                            <p className="text-xs font-bold text-black">{order.customerName}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {order.customerPhone}
                            </p>
                          </div>
                        </TableCell>

                        {/* Products Summary */}
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-medium text-black truncate max-w-[180px]">
                              {primaryItem?.productName ?? 'Product Item'}
                            </p>
                            {extraItemsCount > 0 && (
                              <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                                +{extraItemsCount} more item{extraItemsCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-bold text-xs text-black">
                          {order.totalAmount.toFixed(2)} {order.currency}
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell>
                          <PaymentStatusBadge
                            paymentStatus={order.paymentStatus}
                            paymentMethod={order.paymentMethod}
                          />
                        </TableCell>

                        {/* Order Status Badge */}
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        {/* Quick Actions */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Status Dropdown Selector */}
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateStatus(order.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#FF8C00] focus:outline-none cursor-pointer"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="RETURNED">Returned</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>

                            {/* View Modal Trigger */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveOrder(order)}
                              className="h-8 px-2.5 text-xs text-gray-700 hover:text-[#FF8C00] border-gray-200 flex items-center gap-1 cursor-pointer"
                              title="View full order details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4">
            <DataTablePagination
              currentPage={page}
              pageSize={limit}
              totalItems={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {activeOrder && (
        <OrderDetailsModal
          order={activeOrder}
          isOpen={activeOrder !== null}
          onClose={() => setActiveOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onSaveNotes={handleSaveNotes}
        />
      )}
    </div>
  );
}
