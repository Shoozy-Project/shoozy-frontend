import type { Metadata } from 'next';
import { Package, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Products | Shoezy Admin',
  description: 'Manage Shoezy products catalog.',
};

const mockProducts = [
  { id: 'PROD-101', name: 'Air Monarch IV', sku: 'NIKE-AM-001', category: 'Sneakers', price: '$189', stock: 45, status: 'In Stock' },
  { id: 'PROD-102', name: 'Urban Leather Boot', sku: 'SHZ-UL-002', category: 'Boots', price: '$245', stock: 12, status: 'Low Stock' },
  { id: 'PROD-103', name: 'Slim Runner Pro', sku: 'RUN-SR-003', category: 'Sports', price: '$129', stock: 0, status: 'Out of Stock' },
  { id: 'PROD-104', name: 'Classic Oxford', sku: 'SHZ-CO-004', category: 'Formal', price: '$310', stock: 28, status: 'In Stock' },
  { id: 'PROD-105', name: 'Street Flex 2.0', sku: 'CAS-SF-005', category: 'Casual', price: '$98', stock: 85, status: 'In Stock' },
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF8C00]" /> Products Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store shoe inventory, categories, pricing, and stock levels.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider text-[10px] font-semibold text-gray-500">Total Products</CardDescription>
            <CardTitle className="text-2xl font-bold">364</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider text-[10px] font-semibold text-gray-500">In Stock Products</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">328</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider text-[10px] font-semibold text-gray-500">Low or Out of Stock</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600">36</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Shoes List</CardTitle>
            <CardDescription>View, search, and edit your shoe listings.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{p.id}</TableCell>
                    <TableCell className="font-medium text-black">{p.name}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="text-gray-500">{p.category}</TableCell>
                    <TableCell className="font-semibold text-black">{p.price}</TableCell>
                    <TableCell className="font-medium">{p.stock} units</TableCell>
                    <TableCell>
                      <Badge className={
                        p.status === 'In Stock'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border border-green-200'
                          : p.status === 'Low Stock'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-50 border border-red-200'
                      }>
                        {p.status}
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
