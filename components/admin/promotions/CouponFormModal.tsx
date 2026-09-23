'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Tag, Loader2, Sparkles, Percent, DollarSign, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { promotionsApi, type CouponDto, type DiscountType } from '@/lib/api/promotions';
import { formatMinorAmount, majorToMinorString } from '@/lib/format-money';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: CouponDto | null;
}

export default function CouponFormModal({
  isOpen,
  onClose,
  couponToEdit,
}: CouponFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!couponToEdit;

  const [name, setName] = useState(couponToEdit?.name ?? '');
  const [code, setCode] = useState(couponToEdit?.code ?? '');
  const [priority, setPriority] = useState(couponToEdit?.priority.toString() ?? '0');
  const [type, setType] = useState<DiscountType>(couponToEdit?.type ?? 'PERCENTAGE');
  const [valueInput, setValueInput] = useState(() => couponToEdit
    ? couponToEdit.type === 'FIXED_AMOUNT'
      ? formatMinorAmount(couponToEdit.value, 3)
      : (Number(couponToEdit.value) / 100).toString()
    : '10');
  const [minOrderInput, setMinOrderInput] = useState(() => couponToEdit?.minOrderMinor
    ? formatMinorAmount(couponToEdit.minOrderMinor, 3)
    : '0');
  const [usageLimitInput, setUsageLimitInput] = useState(couponToEdit?.usageLimit?.toString() ?? '');
  const [startDate, setStartDate] = useState(couponToEdit?.startsAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(couponToEdit?.endsAt?.slice(0, 10) ?? '');
  const [isActive, setIsActive] = useState(couponToEdit?.isActive ?? true);
  const [combinable, setCombinable] = useState(couponToEdit?.combinable ?? true);

  const mutation = useMutation({
    mutationFn: async () => {
      const numericVal = parseFloat(valueInput) || 0;
      const value = type === 'FIXED_AMOUNT'
        ? majorToMinorString(valueInput, 3)
        : type === 'PERCENTAGE' ? String(Math.round(numericVal * 100)) : '0';
      const minOrderMinorValue = majorToMinorString(minOrderInput, 3);
      const minOrderMinor = minOrderMinorValue === '0' ? null : minOrderMinorValue;
      const usageLimit = usageLimitInput.trim() ? parseInt(usageLimitInput, 10) : null;

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        scope: 'ORDER' as const,
        priority: Number.parseInt(priority, 10) || 0,
        value,
        currency: type === 'FIXED_AMOUNT' ? 'TND' : null,
        minOrderMinor,
        maxDiscountMinor: null,
        usageLimit,
        perCustomerLimit: null,
        startsAt: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endsAt: endDate ? new Date(endDate).toISOString() : null,
        isActive,
        combinable,
        targets: [],
      };

      if (isEditing && couponToEdit) {
        return promotionsApi.updateCoupon(couponToEdit.id, payload);
      }
      return promotionsApi.createCoupon(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? `Coupon '${code.toUpperCase()}' updated` : `Coupon '${code.toUpperCase()}' created`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      onClose();
    },
    onError: (err) => {
      let msg = 'Failed to save coupon';
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      }
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Discount name and coupon code are required');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF8C00]">
            <Tag className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Coupon Code' : 'Create New Coupon'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            Configure discount code rules, order thresholds, and expiry limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Summer sale" maxLength={150} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</Label>
              <Input type="number" min="0" value={priority} onChange={(event) => setPriority(event.target.value)} />
            </div>
          </div>
          {/* Coupon Code Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Coupon Code <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SHOESY10"
                className="font-mono font-bold uppercase tracking-wider text-base border-gray-200 focus:border-[#FF8C00] focus:ring-[#FF8C00]/20"
                maxLength={30}
              />
              <Sparkles className="w-4 h-4 text-[#FF8C00] absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
            </div>
          </div>

          {/* Discount Type Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Discount Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('PERCENTAGE')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'PERCENTAGE'
                    ? 'border-[#FF8C00] bg-[#FFF3E0] text-[#FF8C00] shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Percent className="w-4 h-4 mb-1" />
                Percentage (%)
              </button>

              <button
                type="button"
                onClick={() => setType('FIXED_AMOUNT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'FIXED_AMOUNT'
                    ? 'border-[#FF8C00] bg-[#FFF3E0] text-[#FF8C00] shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4 mb-1" />
                Fixed (TND)
              </button>

              <button
                type="button"
                onClick={() => setType('FREE_SHIPPING')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'FREE_SHIPPING'
                    ? 'border-[#FF8C00] bg-[#FFF3E0] text-[#FF8C00] shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Truck className="w-4 h-4 mb-1" />
                Free Shipping
              </button>
            </div>
          </div>

          {/* Discount Value Input (Hidden if Free Shipping) */}
          {type !== 'FREE_SHIPPING' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                {type === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (TND)'}
              </Label>
              <Input
                type="number"
                step={type === 'PERCENTAGE' ? '1' : '0.500'}
                min="0.1"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder={type === 'PERCENTAGE' ? '10' : '15.000'}
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>
          )}

          {/* Min Order & Usage Limit Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Min Order (TND)
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={minOrderInput}
                onChange={(e) => setMinOrderInput(e.target.value)}
                placeholder="0 = No Min"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Usage Limit
              </Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={usageLimitInput}
                onChange={(e) => setUsageLimitInput(e.target.value)}
                placeholder="Unlimited"
                className="border-gray-200 focus:border-[#FF8C00]"
              />
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-200 focus:border-[#FF8C00] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-200 focus:border-[#FF8C00] text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <Label className="text-xs font-bold text-gray-900 cursor-pointer">
                  Stackable with Sale Items
                </Label>
                <p className="text-[11px] text-gray-500">
                  Allow coupon to stack on top of base sale prices
                </p>
              </div>
              <Switch checked={combinable} onCheckedChange={setCombinable} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <Label className="text-xs font-bold text-gray-900 cursor-pointer">
                  Active Status
                </Label>
                <p className="text-[11px] text-gray-500">Enable code for customer checkout</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#FF8C00] hover:bg-[#e67e00] text-white text-xs font-bold px-6 shadow-md shadow-[#FF8C00]/20"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Coupon'
              ) : (
                'Create Coupon'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
