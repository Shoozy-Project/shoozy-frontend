import type { Metadata } from 'next';
import { Grid, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Categories | Shoezy Admin',
  description: 'Manage Shoezy product categories.',
};

const mockCategories = [
  { id: 'CAT-101', name: 'Sneakers', description: 'Athletic, casual, and street-style sneakers.', slug: 'sneakers', count: 142, status: 'Active' },
  { id: 'CAT-102', name: 'Boots', description: 'Rugged, leather, and outdoor boots.', slug: 'boots', count: 54, status: 'Active' },
  { id: 'CAT-103', name: 'Sports', description: 'Running, training, and performance shoes.', slug: 'sports', count: 72, status: 'Active' },
  { id: 'CAT-104', name: 'Formal', description: 'Oxford, Derby, and dress shoes.', slug: 'formal', count: 32, status: 'Active' },
  { id: 'CAT-105', name: 'Casual', description: 'Loafers, slip-ons, and daily wear.', slug: 'casual', count: 64, status: 'Active' },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#FF8C00]" /> Product Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize products into parent categories, sub-categories, and edit details.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Categories List</CardTitle>
            <CardDescription>View, search, and manage your product categories.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Category ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Product Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCategories.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{c.id}</TableCell>
                    <TableCell className="font-medium text-black">{c.name}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{c.slug}</TableCell>
                    <TableCell className="text-gray-500 max-w-xs truncate">{c.description}</TableCell>
                    <TableCell className="font-semibold text-black">{c.count} items</TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
                        {c.status}
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
