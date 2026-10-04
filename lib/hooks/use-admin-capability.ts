'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '@/lib/api/admin-dashboard';

export const adminCapabilityQueryKey = (userId: string) => ['admin-capability', userId] as const;

export function adminCapabilityQueryOptions(userId: string) {
  return queryOptions({
    queryKey: adminCapabilityQueryKey(userId),
    queryFn: () => adminDashboardApi.summary().then((response) => response.data.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useAdminCapability(enabled = true, userId?: string) {
  return useQuery({
    ...adminCapabilityQueryOptions(userId ?? 'anonymous'),
    enabled: enabled && !!userId,
  });
}
