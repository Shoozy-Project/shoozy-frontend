import type { Metadata } from 'next';
import { ShoppingCart, Search, Eye, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Orders | Shoezy Admin',
  description: 'Manage Shoezy store customer orders.',
};

const mockOrders = [
  { id: '#SHZ-1042', customer: 'Amira Ben Ali', product: 'Air Monarch IV', amount: '$189', status: 'Delivered', date: '2 hours ago', payment: 'Cash on Delivery' },
  { id: '#SHZ-1041', customer: 'Yassine Mrad', product: 'Urban Leather Boot', amount: '$245', status: 'Processing', date: '5 hours ago', payment: 'Cash on Delivery' },
  { id: '#SHZ-1040', customer: 'Sana Karoui', product: 'Slim Runner Pro', amount: '$129', status: 'Shipped', date: '8 hours ago', payment: 'Cash on Delivery' },
  { id: '#SHZ-1039', customer: 'Mohamed Khalil', product: 'Classic Oxford', amount: '$310', status: 'Delivered', date: '1 day ago', payment: 'Cash on Delivery' },
  { id: '#SHZ-1038', customer: 'Ines Trabelsi', product: 'Street Flex 2.0', amount: '$98', status: 'Cancelled', date: '1 day ago', payment: 'Cash on Delivery' },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#FF8C00]" /> Orders Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fulfill orders, check shipping statuses, and track Cash on Delivery (COD) payments.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Orders List</CardTitle>
            <CardDescription>Track customer purchases and COD verification status.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product Purchased</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{order.id}</TableCell>
                    <TableCell className="font-medium text-black">{order.customer}</TableCell>
                    <TableCell className="text-gray-500">{order.product}</TableCell>
                    <TableCell className="font-semibold text-black">{order.amount}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-semibold">{order.payment}</TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === 'Delivered'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border border-green-200'
                          : order.status === 'Processing'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200'
                            : order.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-50 border border-red-200'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{order.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <CheckCircle className="w-4 h-4 text-green-600" />
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
