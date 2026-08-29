'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Truck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { promotionsApi, type CouponDto } from '@/lib/api/promotions';
import dynamic from 'next/dynamic';

const CouponFormModal = dynamic(() => import('./CouponFormModal'), { ssr: false });
const DeleteCouponDialog = dynamic(() => import('./DeleteCouponDialog'), { ssr: false });

export default function CouponsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<CouponDto | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponDto | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await promotionsApi.listCoupons();
      return res.data.data;
    },
  });

  if (isError) {
    console.error('Error fetching admin coupons:', error);
  }

  const coupons = Array.isArray(data) ? data : [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionsApi.toggleCouponActive(id, isActive),
    onSuccess: () => {
      toast.success('Coupon status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied '${code}' to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponStatus = (c: CouponDto) => {
    if (!c.isActive) return { label: 'Disabled', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    if (c.endsAt && new Date(c.endsAt) < new Date()) {
      return { label: 'Expired', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    return { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  const formatValue = (c: CouponDto) => {
    if (c.type === 'FREE_SHIPPING') return 'Free Shipping';
    if (c.type === 'FIXED_AMOUNT') return `${(c.value / 1000).toFixed(3)} TND`;
    return `${c.value}% OFF`;
  };

  const formatMinOrder = (c: CouponDto) => {
    if (!c.minOrderMinor || c.minOrderMinor === 0) return 'None';
    return `${(c.minOrderMinor / 1000).toFixed(3)} TND`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FF8C00]" /> Promo Codes & Stackable Coupons
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage checkout discount codes. Coupons stack with base sale prices by default.
          </p>
        </div>
        <Button
          onClick={() => {
            setCouponToEdit(null);
            setModalOpen(true);
          }}
          className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md shadow-[#FF8C00]/20"
        >
          <Plus className="w-4 h-4" /> Add Code
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Active Coupons ({filteredCoupons.length})</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              View redemption history and configure promotional parameters.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon codes..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[120px] text-xs font-bold">ID</TableHead>
                  <TableHead className="text-xs font-bold">Promo Code</TableHead>
                  <TableHead className="text-xs font-bold">Type</TableHead>
                  <TableHead className="text-xs font-bold">Value</TableHead>
                  <TableHead className="text-xs font-bold">Min Order</TableHead>
                  <TableHead className="text-xs font-bold">Usages</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-center">Enable</TableHead>
                  <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="w-6 h-6 text-[#FF8C00] animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Loading coupons...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No coupons found</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first promo code using the "+ Add Code" button.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((c) => {
                    const status = getCouponStatus(c);
                    return (
                      <TableRow key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">
                          #{c.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {c.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(c.code)}
                              title="Copy Code"
                              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              {copiedCode === c.code ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            {c.type === 'PERCENTAGE' && <Percent className="w-3.5 h-3.5 text-[#FF8C00]" />}
                            {c.type === 'FIXED_AMOUNT' && <DollarSign className="w-3.5 h-3.5 text-green-600" />}
                            {c.type === 'FREE_SHIPPING' && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                            {c.type.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-green-600 text-xs">
                          {formatValue(c)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 font-medium">
                          {formatMinOrder(c)}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-gray-600">
                          {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'times'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] font-semibold px-2 py-0.5 ${status.color}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={c.isActive}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: c.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCouponToEdit(c);
                                setModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCouponToDelete(c);
                                setDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
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
        </CardContent>
      </Card>

      {/* Modal Dialogs */}
      {modalOpen && (
        <CouponFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setCouponToEdit(null);
          }}
          couponToEdit={couponToEdit}
        />
      )}

      {deleteDialogOpen && (
        <DeleteCouponDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setCouponToDelete(null);
          }}
          coupon={couponToDelete}
        />
      )}
    </div>
  );
}
