'use client';

import { useState } from 'react';
import { Calendar, Loader2, Mail, MapPin, Package, Phone, Truck, User } from 'lucide-react';
import type { OrderAction, OrderActionPayload, OrderDetailDto } from '@/lib/api/orders';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import { formatMinorMoney } from '@/lib/format-money';

interface Props {
  order: OrderDetailDto | null;
  loading: boolean;
  error: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: OrderAction, payload?: OrderActionPayload) => Promise<void>;
  actionPending: boolean;
}

export default function OrderDetailsModal({ order, loading, error, isOpen, onClose, onAction, actionPending }: Props) {
  const [shippingProvider, setShippingProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const actions: Array<{ action: OrderAction; label: string; className?: string }> = !order ? [] : order.status === 'PENDING'
    ? [{ action: 'confirm', label: 'Confirm Order' }, { action: 'cancel', label: 'Cancel Order', className: 'bg-red-600 hover:bg-red-700' }]
    : order.status === 'CONFIRMED'
      ? [{ action: 'ship', label: 'Mark Shipped' }, { action: 'cancel', label: 'Cancel Order', className: 'bg-red-600 hover:bg-red-700' }]
      : order.status === 'SHIPPED' ? [{ action: 'deliver', label: 'Mark Delivered' }] : [];

  const execute = (action: OrderAction) => onAction(action, action === 'ship' ? {
    shippingProvider: shippingProvider.trim() || undefined,
    trackingNumber: trackingNumber.trim() || null,
  } : {});

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
      {loading && <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#FF8C00]" /></div>}
      {error && <div className="py-24 text-center text-sm text-red-600">Failed to load order details.</div>}
      {order && <>
        <DialogHeader className="p-5 sm:p-6 border-b bg-gray-50/70">
          <div className="flex items-center gap-3"><DialogTitle className="text-xl font-bold font-mono text-[#FF8C00]">{order.orderNumber}</DialogTitle><OrderStatusBadge status={order.status} /></div>
          <DialogDescription className="text-xs flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Placed {new Date(order.placedAt || order.createdAt).toLocaleString()}</DialogDescription>
        </DialogHeader>
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="p-4 rounded-xl border bg-gray-50/50"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#FF8C00]" />Customer</h3><p className="text-sm font-semibold">{order.customerFirstName} {order.customerLastName}</p><p className="text-xs mt-2 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{order.customerPhone}</p><p className="text-xs mt-1 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{order.customerEmail}</p></section>
            <section className="p-4 rounded-xl border bg-gray-50/50"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-[#FF8C00]" />Shipping Address</h3>{order.address ? <div className="text-xs text-gray-700"><p className="font-semibold">{order.address.recipientName}</p><p className="mt-1">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p><p>{order.address.city}, {order.address.state}, {order.address.countryCode}</p></div> : <p className="text-xs text-gray-400">No address snapshot.</p>}</section>
          </div>
          <section className="border rounded-xl overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b"><h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4 text-[#FF8C00]" />Items ({order.items.length})</h3></div><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Product</th><th className="p-3 text-left">SKU</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-t"><td className="p-3"><p className="font-semibold">{item.productName}</p><p className="text-gray-500">{item.variantName}</p></td><td className="p-3 font-mono">{item.sku}</td><td className="p-3 text-center">{item.quantity}</td><td className="p-3 text-right font-bold">{formatMinorMoney(item.lineTotalMinor, order.totals.currency)}</td></tr>)}</tbody></table></div><div className="p-4 bg-gray-50 border-t flex items-end justify-between"><PaymentStatusBadge paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} /><div className="text-right text-xs space-y-1"><p>Subtotal: {formatMinorMoney(order.totals.subtotalMinor, order.totals.currency)}</p><p>Shipping: {formatMinorMoney(order.totals.shippingMinor, order.totals.currency)}</p><p className="font-bold text-sm text-[#FF8C00]">Total: {formatMinorMoney(order.totals.totalMinor, order.totals.currency)}</p></div></div></section>
          {(order.shippingProvider || order.trackingNumber) && <section className="p-4 rounded-xl border text-xs"><h3 className="font-bold uppercase tracking-wider flex items-center gap-2 mb-2"><Truck className="w-4 h-4 text-[#FF8C00]" />Shipment</h3><p>Provider: {order.shippingProvider ?? '—'}</p><p>Tracking: {order.trackingNumber ?? '—'}</p></section>}
          {order.notes && <section className="p-4 rounded-xl border bg-gray-50 text-xs"><h3 className="font-bold mb-2">Order Notes</h3><p className="text-gray-600">{order.notes}</p></section>}
          {order.status === 'CONFIRMED' && <section className="p-4 rounded-xl border space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider">Shipping details</h3><div className="grid grid-cols-2 gap-3"><input value={shippingProvider} onChange={(event) => setShippingProvider(event.target.value)} placeholder="Shipping provider (required)" className="px-3 py-2 text-xs border rounded-lg" /><input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking number (optional)" className="px-3 py-2 text-xs border rounded-lg" /></div></section>}
          {actions.length > 0 && <div className="flex justify-end gap-2">{actions.map((item) => <Button key={item.action} disabled={actionPending || (item.action === 'ship' && !shippingProvider.trim())} onClick={() => execute(item.action)} className={item.className}>{actionPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{item.label}</Button>)}</div>}
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}
