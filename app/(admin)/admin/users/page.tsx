import type { Metadata } from 'next';
import { Users, Search, Eye, Edit, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Users | Shoezy Admin',
  description: 'Manage Shoezy store users and administrators.',
};

const mockUsers = [
  { id: 'USR-001', name: 'Amira Ben Ali', email: 'amira@gmail.com', role: 'Customer', governorate: 'Tunis', status: 'Active' },
  { id: 'USR-002', name: 'Yassine Mrad', email: 'yassine@yahoo.com', role: 'Customer', governorate: 'Sousse', status: 'Active' },
  { id: 'USR-003', name: 'Sana Karoui', email: 'sana@hotmail.com', role: 'Customer', governorate: 'Sfax', status: 'Active' },
  { id: 'USR-004', name: 'Mohamed Khalil', email: 'khalil@outlook.com', role: 'Customer', governorate: 'Nabeul', status: 'Inactive' },
  { id: 'USR-005', name: 'Admin User', email: 'admin@shoezy.tn', role: 'Admin', governorate: 'Tunis', status: 'Active' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF8C00]" /> Users & Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse registered customer profiles, view regions, change access roles, and deactivate accounts.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Users Directory</CardTitle>
            <CardDescription>View, search, and manage registered store accounts.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">User ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Governorate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{user.id}</TableCell>
                    <TableCell className="font-medium text-black">{user.name}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{user.email}</TableCell>
                    <TableCell className="text-gray-500 font-semibold">{user.governorate}</TableCell>
                    <TableCell>
                      <Badge className={
                        user.role === 'Admin'
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-50 border border-purple-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        user.status === 'Active'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border border-green-200'
                          : 'bg-red-50 text-red-700 hover:bg-red-50 border border-red-200'
                      }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
