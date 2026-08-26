'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  Users,
  Search,
  Edit,
  Eye,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  FilterX,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

import dynamic from 'next/dynamic';
import { adminUsersApi } from '@/lib/api/users';
import type { UserDto, UserListParams, UserRoleType, UserStatusType } from '@/types/user';

const ViewUserModal = dynamic(() => import('./ViewUserModal'), { ssr: false });
const EditUserModal = dynamic(() => import('./EditUserModal'), { ssr: false });
const SuspendUserDialog = dynamic(() => import('./SuspendUserDialog'), { ssr: false });

type RoleFilter = 'all' | 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Format UUID into sleek short User ID badge string (e.g. USR-001)
const formatUserId = (id: string, index?: number) => {
  const shortHex = id.replace(/-/g, '').slice(0, 3).toUpperCase();
  return `USR-${shortHex}`;
};

// ─── Skeleton Row ────────────────────────────────────────────────
const SkeletonRow = () => (
  <TableRow>
    <TableCell><div className="h-4 w-14 bg-gray-200 rounded animate-pulse" /></TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
    <TableCell><div className="h-4 w-36 bg-gray-100 rounded animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
    <TableCell><div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" /></TableCell>
    <TableCell><div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" /></TableCell>
    <TableCell>
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </TableCell>
  </TableRow>
);

const UsersClient = () => {
  const queryClient = useQueryClient();

  // ─── Local State ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rawSearch, setRawSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [viewTarget, setViewTarget] = useState<UserDto | null>(null);
  const [editTarget, setEditTarget] = useState<UserDto | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserDto | null>(null);

  // ─── Debounced Search (300ms) ──────────────────────────────
  const [debouncedSearch] = useDebounce(rawSearch, 300);

  // ─── Query Params ──────────────────────────────────────────
  const queryParams: UserListParams = {
    page,
    limit,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  // ─── Fetch Users Query ─────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => adminUsersApi.list(queryParams).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const users = data?.items ?? [];
  const pagination = data?.pagination;

  // ─── Handlers ──────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value as RoleFilter);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(1);
  };

  const handleClearFilters = () => {
    setRawSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = rawSearch.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* ─── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF8C00]" aria-hidden="true" />
            Users & Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse registered customer profiles, view regions, change access roles, and deactivate accounts.
          </p>
        </div>
      </div>

      {/* ─── Table Section ────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Header Search & Filter */}
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">Registered Users Directory</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {pagination ? `${pagination.total} total registered accounts` : 'View customer profiles and manage administrative roles.'}
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="user-search"
                type="text"
                value={rawSearch}
                onChange={handleSearchChange}
                placeholder="Search name, email, region..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0"
                aria-label="Search users"
              />
            </div>

            {/* Role Filter */}
            <select
              id="user-role-filter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            {/* Status Filter */}
            <select
              id="user-status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-black flex items-center gap-1.5 shrink-0"
              >
                <FilterX className="w-4 h-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Data Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-[110px]">User ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Governorate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} />
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <p className="text-sm font-medium">Failed to load users.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state */}
                {!isLoading && !isError && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserX className="w-6 h-6 text-gray-300" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-[#FF8C00] font-medium text-gray-500">No users found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {hasActiveFilters ? 'Try adjusting search or filter parameters.' : 'No registered users match this directory query.'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  users.map((u, index) => (
                    <TableRow key={u.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* User ID */}
                      <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">
                        {formatUserId(u.id, index)}
                      </TableCell>

                      {/* Full Name + Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FFF3E0] border border-[#FF8C00]/20 flex items-center justify-center text-[#FF8C00] font-semibold text-xs shrink-0">
                            {u.firstName?.[0] || 'U'}
                          </div>
                          <span className="font-semibold text-sm text-black">
                            {u.fullName || `${u.firstName} ${u.lastName}`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-xs text-gray-600 font-medium">
                        {u.email}
                      </TableCell>

                      {/* Governorate */}
                      <TableCell>
                        <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF8C00]" />
                          {u.governorate || 'Tunis'}
                        </span>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        {u.role === 'SUPER_ADMIN' ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300 text-xs gap-1 font-semibold">
                            <Shield className="w-3 h-3 text-amber-600" />
                            Super Admin
                          </Badge>
                        ) : u.role === 'ADMIN' ? (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs gap-1">
                            <UserIcon className="w-3 h-3 text-gray-500" />
                            Customer
                          </Badge>
                        )}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {u.status === 'ACTIVE' ? (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 text-xs">
                            Active
                          </Badge>
                        ) : u.status === 'SUSPENDED' ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 text-xs font-semibold">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border border-gray-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Profile */}
                          <Button
                            id={`view-user-${u.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewTarget(u)}
                            className="h-8 w-8 p-0 hover:bg-amber-50"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4 text-[#FF8C00]" />
                          </Button>

                          {/* Edit / Change Role */}
                          <Button
                            id={`edit-user-${u.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditTarget(u)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title="Edit User & Role"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>

                          {/* Suspend / Deactivate */}
                          <Button
                            id={`suspend-user-${u.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuspendTarget(u)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                          >
                            {u.status === 'ACTIVE' ? (
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* ─── Pagination ──────────────────────────────────────── */}
          {pagination && (
            <DataTablePagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              itemLabel="users"
            />
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ────────────────────────────────────────────── */}
      <ViewUserModal
        open={!!viewTarget}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        user={viewTarget}
      />

      <EditUserModal
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        user={editTarget}
      />

      <SuspendUserDialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
        user={suspendTarget}
      />
    </div>
  );
};

export default UsersClient;
