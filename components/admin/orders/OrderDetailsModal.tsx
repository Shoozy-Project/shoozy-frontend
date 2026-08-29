'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  Save,
  Package,
  Calendar,
  User,
  Truck,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import type { OrderDto, OrderStatus } from '@/lib/api/orders';
import { toast } from 'sonner';

interface OrderDetailsModalProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveNotes,
}: OrderDetailsModalProps) {
  const [notes, setNotes] = useState(order?.internalNotes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);

  if (!order) return null;

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onSaveNotes(order.id, notes);
      toast.success('Internal notes saved successfully.');
    } catch {
      toast.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    setUpdatingStatus(nextStatus);
    try {
      await onUpdateStatus(order.id, nextStatus, `Updated to ${nextStatus} via details modal`);
      toast.success(`Order status updated to ${nextStatus}.`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const statusOptions: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Mark Pending' },
    { status: 'CONFIRMED', label: 'Mark Confirmed' },
    { status: 'SHIPPED', label: 'Mark Shipped' },
    { status: 'DELIVERED', label: 'Mark Delivered' },
    { status: 'RETURNED', label: 'Mark Returned' },
    { status: 'CANCELLED', label: 'Cancel Order' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl bg-white border border-gray-200 shadow-2xl">
        {/* Header Bar */}
        <DialogHeader className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold font-mono text-[#FF8C00]">
                  {order.orderNumber}
                </DialogTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <DialogDescription className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Placed on {new Date(order.createdAt).toLocaleString()}
              </DialogDescription>
            </div>

            {/* Quick Status Buttons in Header */}
            <div className="flex items-center gap-2">
              <select
                value={order.status}
                disabled={updatingStatus !== null}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#FF8C00] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.status} value={opt.status}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Top Info Grid: Customer & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF8C00]" /> Customer Profile
              </h3>
              <div>
                <p className="text-sm font-semibold text-black">{order.customerName}</p>
                <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-2 text-black font-medium hover:text-[#FF8C00] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {order.customerPhone}
                  </a>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {order.customerEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Delivery Address */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF8C00]" /> Shipping Address
              </h3>
              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-semibold text-black flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  {order.shippingAddress.street}
                </p>
                <p className="pl-5 text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
                {order.deliveryNotes && (
                  <div className="mt-2 pl-5 text-[11px] italic bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                    &quot;{order.deliveryNotes}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Products Breakdown Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FF8C00]" /> Items Ordered ({order.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/60 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4">Item Details</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-black">{item.productName}</p>
                            <p className="text-[11px] text-gray-500">{item.variantInfo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-black">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-700">
                        {item.unitPrice.toFixed(2)} {order.currency}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-black">
                        {item.totalPrice.toFixed(2)} {order.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <PaymentStatusBadge
                  paymentStatus={order.paymentStatus}
                  paymentMethod={order.paymentMethod}
                />
              </div>

              <div className="space-y-1 text-right text-xs">
                <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{order.subtotal.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
                  <span>Shipping Fee:</span>
                  <span className="font-medium">{order.shippingFee.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-black pt-1 border-t border-gray-200">
                  <span>Total Amount (COD):</span>
                  <span className="text-[#FF8C00]">{order.totalAmount.toFixed(2)} {order.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF8C00]" /> Status Timeline & Audit Trail
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {order.statusHistory.map((step) => (
                <div key={step.id} className="relative flex items-start justify-between gap-3 text-xs">
                  <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#FF8C00] border-2 border-white ring-2 ring-orange-100" />
                  <div>
                    <p className="font-semibold text-black flex items-center gap-2">
                      <span>Status updated to:</span>
                      <span className="font-bold text-[#FF8C00]">{step.status}</span>
                    </p>
                    {step.note && <p className="text-gray-600 mt-0.5 italic">&quot;{step.note}&quot;</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">Updated by {step.createdBy}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(step.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Internal Notes Field */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF8C00]" /> Internal Admin Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal operational notes (e.g. Phone call verification timestamp, delivery instructions)..."
              rows={3}
              className="w-full p-3 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#FF8C00] focus:outline-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="bg-black hover:bg-gray-800 text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {savingNotes ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Internal Notes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
