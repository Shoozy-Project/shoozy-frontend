import type { Metadata } from 'next';
import { Tag, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Promotions | Shoezy Admin',
  description: 'Manage Shoezy store promotional discounts and coupon codes.',
};

const mockPromotions = [
  { id: 'PROM-101', code: 'SHOEZY10', type: 'Percentage', value: '10%', minOrder: '$50', status: 'Active', usage: '234 times' },
  { id: 'PROM-102', code: 'FREESHIP99', type: 'Free Shipping', value: 'Free Shipping', minOrder: '$99', status: 'Active', usage: '1,102 times' },
  { id: 'PROM-103', code: 'SUMMER20', type: 'Percentage', value: '20%', minOrder: '$80', status: 'Expired', usage: '480 times' },
  { id: 'PROM-104', code: 'WELCOME15', type: 'Percentage', value: '15%', minOrder: 'None', status: 'Active', usage: '89 times' },
];

export default function AdminPromotionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#FF8C00]" /> Promotions & Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure coupons, discounts, codes, and order thresholds for customer savings.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Code
        </Button>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Coupons list</CardTitle>
            <CardDescription>View status, value, and usage statistics of promotional coupons.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupon codes..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Coupon ID</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Discount Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min Order Requirement</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPromotions.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{p.id}</TableCell>
                    <TableCell className="font-mono font-bold text-black text-sm">{p.code}</TableCell>
                    <TableCell className="text-gray-500">{p.type}</TableCell>
                    <TableCell className="font-semibold text-green-600">{p.value}</TableCell>
                    <TableCell className="text-gray-500 font-medium">{p.minOrder}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{p.usage}</TableCell>
                    <TableCell>
                      <Badge className={
                        p.status === 'Active'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border border-green-200'
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
