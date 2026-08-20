import type { Metadata } from 'next';
import { Award, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Brands | Shoezy Admin',
  description: 'Manage Shoezy product brands.',
};

const mockBrands = [
  { id: 'BRD-101', name: 'Nike', description: 'Just Do It. Athletic and lifestyle wear.', website: 'nike.com', count: 124, status: 'Active' },
  { id: 'BRD-102', name: 'Adidas', description: 'Impossible is Nothing. Sports apparel and footwear.', website: 'adidas.com', count: 98, status: 'Active' },
  { id: 'BRD-103', name: 'Puma', description: 'Forever Faster. Active shoes and clothing.', website: 'puma.com', count: 64, status: 'Active' },
  { id: 'BRD-104', name: 'Timberland', description: 'Premium leather boots and outdoor equipment.', website: 'timberland.com', count: 32, status: 'Active' },
  { id: 'BRD-105', name: 'Shoezy Exclusive', description: 'Our in-house luxury shoe collection.', website: 'shoezy.tn', count: 46, status: 'Active' },
];

export default function AdminBrandsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FF8C00]" /> Brands Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage partner manufacturers, logos, websites, and total linked catalog items.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Brand
        </Button>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Brands List</CardTitle>
            <CardDescription>View and manage all associated partner brands.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Brand ID</TableHead>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBrands.map((b) => (
                  <TableRow key={b.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{b.id}</TableCell>
                    <TableCell className="font-medium text-black">{b.name}</TableCell>
                    <TableCell className="text-blue-600 underline font-mono text-xs cursor-pointer">{b.website}</TableCell>
                    <TableCell className="text-gray-500 max-w-xs truncate">{b.description}</TableCell>
                    <TableCell className="font-semibold text-black">{b.count} items</TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
                        {b.status}
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
                          <Trash2 className="w-4 h-4 text-red-600" />
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
