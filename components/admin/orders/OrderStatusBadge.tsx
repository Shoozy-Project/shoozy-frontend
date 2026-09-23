'use client';

import { Badge } from '@/components/ui/badge';
import type { OrderStatus, PaymentStatus } from '@/lib/api/orders';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const getBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/80';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100/80';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100/80';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80';
      case 'RETURNED':
        return 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100/80';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100/80';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Verification';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      case 'RETURNED':
        return 'Returned';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-semibold px-2.5 py-0.5 rounded-full border text-xs tracking-wide shadow-xs transition-colors ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {getLabel(status)}
    </Badge>
  );
}

interface PaymentStatusBadgeProps {
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
}

export function PaymentStatusBadge({
  paymentStatus,
  paymentMethod = 'COD',
}: PaymentStatusBadgeProps) {
  const getStyle = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded">
        {paymentMethod}
      </span>
      <span
        className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getStyle(
          paymentStatus
        )}`}
      >
        {paymentStatus}
      </span>
    </div>
  );
}
