'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Eye, FilterX, Search, ShieldAlert, ShieldCheck, UserX, Users } from 'lucide-react';
import { adminCustomersApi } from '@/lib/api/users';
import type { CustomerDto, CustomerStatus } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import ViewUserModal from './ViewUserModal';
import SuspendUserDialog from './SuspendUserDialog';

type StatusFilter = 'all' | CustomerStatus;

export default function UsersClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 350);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [viewTarget, setViewTarget] = useState<CustomerDto | null>(null);
  const [statusTarget, setStatusTarget] = useState<CustomerDto | null>(null);
  const params = {
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: status === 'all' ? undefined : status,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => adminCustomersApi.list(params).then((response) => response.data.data),
    placeholderData: (previous) => previous,
  });
  const customers = data?.items ?? [];
  const pagination = data?.pagination;
  const hasFilters = search.trim() !== '' || status !== 'all';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
          <Users className="w-6 h-6 text-[#FF8C00]" /> Customers
        </h1>
        <p className="text-sm text-gray-500 mt-1">Browse registered customers and manage supported account status changes.</p>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">Customer Directory</CardTitle>
              <CardDescription className="text-xs mt-0.5">{pagination ? `${pagination.total} customers` : 'Customer accounts'}</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email, or phone" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]" />
            </div>
            <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('all'); setPage(1); }}><FilterX className="w-4 h-4 mr-1" />Clear</Button>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-gray-50/80"><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, index) => <TableRow key={index}><TableCell colSpan={7}><div className="h-10 bg-gray-100 animate-pulse rounded" /></TableCell></TableRow>)}
                {isError && !isLoading && <TableRow><TableCell colSpan={7} className="py-12 text-center"><p className="text-sm text-gray-500 mb-2">Failed to load customers.</p><Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button></TableCell></TableRow>}
                {!isLoading && !isError && customers.length === 0 && <TableRow><TableCell colSpan={7} className="py-16 text-center"><UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">No customers found.</p></TableCell></TableRow>}
                {!isLoading && customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[#FF8C00] font-semibold">{customer.firstName[0]}</div><span className="font-semibold text-sm">{customer.firstName} {customer.lastName}</span></div></TableCell>
                    <TableCell className="text-xs text-gray-600">{customer.email}</TableCell>
                    <TableCell className="text-xs text-gray-600">{customer.phone ?? 'Not provided'}</TableCell>
                    <TableCell className="text-xs text-gray-600">{customer.provider}</TableCell>
                    <TableCell><Badge className={customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>{customer.status}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setViewTarget(customer)} title="View customer"><Eye className="w-4 h-4 text-[#FF8C00]" /></Button><Button variant="ghost" size="sm" onClick={() => setStatusTarget(customer)} title={customer.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}>{customer.status === 'ACTIVE' ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <ShieldCheck className="w-4 h-4 text-green-600" />}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pagination && <DataTablePagination currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pagination.limit} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} itemLabel="customers" />}
        </CardContent>
      </Card>
      <ViewUserModal open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)} user={viewTarget} />
      <SuspendUserDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)} user={statusTarget} />
    </div>
  );
}
