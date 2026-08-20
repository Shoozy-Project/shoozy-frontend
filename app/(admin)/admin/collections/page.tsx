import type { Metadata } from 'next';
import { Layers, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Collections | Shoezy Admin',
  description: 'Manage Shoezy curated shoe collections.',
};

const mockCollections = [
  { id: 'COL-101', name: 'Summer Vibes 2026', description: 'Lightweight and vibrant sneakers for hot weather.', count: 24, type: 'Seasonal', status: 'Active' },
  { id: 'COL-102', name: 'Winter Boots Premium', description: 'Heavy leather and wool lined boots.', count: 18, type: 'Seasonal', status: 'Active' },
  { id: 'COL-103', name: 'Running Masters', description: 'High performance sports and training collection.', count: 35, type: 'Thematic', status: 'Active' },
  { id: 'COL-104', name: 'Limited Edition drops', description: 'Rare models and collaborations.', count: 8, type: 'Special Drop', status: 'Active' },
];

export default function AdminCollectionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#FF8C00]" /> Product Collections
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Group products into custom thematic or seasonal collections.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Collection
        </Button>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Collections List</CardTitle>
            <CardDescription>View and manage all custom product groupings.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Collection ID</TableHead>
                  <TableHead>Collection Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCollections.map((col) => (
                  <TableRow key={col.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{col.id}</TableCell>
                    <TableCell className="font-medium text-black">{col.name}</TableCell>
                    <TableCell className="text-gray-500 text-xs font-semibold">{col.type}</TableCell>
                    <TableCell className="text-gray-500 max-w-xs truncate">{col.description}</TableCell>
                    <TableCell className="font-semibold text-black">{col.count} items</TableCell>
                    <TableCell>
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
                        {col.status}
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
