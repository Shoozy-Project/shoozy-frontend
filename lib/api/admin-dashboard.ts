import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type { OrderListDto } from './orders';

export interface DashboardOverviewDto {
  timezone: 'UTC';
  range: { dateFrom: string | null; dateTo: string | null };
  customers: { total: number };
  products: { total: number; active: number };
  orders: {
    byStatus: Record<string, { count: number; amountMinor: string }>;
    todayUtc: number;
    placedOrderValue: { count: number; amountMinor: string };
    deliveredOrderValue: { count: number; amountMinor: string };
  };
  cod: {
    collectedValue: { count: number; amountMinor: string };
    pendingCollection: { count: number; amountMinor: string };
  };
  inventory: {
    lowStockThreshold: number;
    lowStockVariants: number;
    outOfStockVariants: number;
  };
  returns: { pending: number };
  semantics: {
    placedOrderValue: string;
    deliveredOrderValue: string;
    collectedValue: string;
    balanceMetrics: string;
  };
}

export interface DashboardSummaryDto {
  overview: DashboardOverviewDto;
  orders: PaginatedData<OrderListDto> & {
    statusSummary: Record<string, { count: number; amountMinor: string }>;
    timezone: 'UTC';
  };
  inventory: PaginatedData<{
    id: string;
    sku: string;
    title: string;
    stockQuantity: number;
    priceMinor: string;
  }> & { threshold: number; state: 'LOW' | 'OUT' | 'ALL' };
}

export const adminDashboardApi = {
  summary: () =>
    apiClient.get<ApiSuccess<DashboardSummaryDto>>('/admin/dashboard/summary'),
};
