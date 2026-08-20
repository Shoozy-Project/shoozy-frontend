import type { Metadata } from 'next';
import { Star, Search, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Reviews | Shoezy Admin',
  description: 'Manage Shoezy store customer reviews and ratings.',
};

const mockReviews = [
  { id: 'REV-101', customer: 'Amira Ben Ali', product: 'Air Monarch IV', rating: 5, comment: 'Extremely comfortable! The build quality is top-notch.', status: 'Approved', date: '2 hours ago' },
  { id: 'REV-102', customer: 'Yassine Mrad', product: 'Urban Leather Boot', rating: 4, comment: 'Nice boots, fits well. A bit heavy but very solid.', status: 'Pending', date: '5 hours ago' },
  { id: 'REV-103', customer: 'Sana Karoui', product: 'Slim Runner Pro', rating: 5, comment: 'Super fast delivery and great customer support in Tunisia!', status: 'Approved', date: '8 hours ago' },
  { id: 'REV-104', customer: 'Mohamed Khalil', product: 'Classic Oxford', rating: 3, comment: 'Slightly tight around the toes, but overall good looking.', status: 'Pending', date: '1 day ago' },
];

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Star className="w-6 h-6 text-[#FF8C00]" /> Product Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Moderate, approve, delete, or inspect customer feedback and shoe ratings.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>Verify feedback and check rating averages.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Review ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReviews.map((rev) => (
                  <TableRow key={rev.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-[#FF8C00] font-semibold">{rev.id}</TableCell>
                    <TableCell className="font-medium text-black">{rev.customer}</TableCell>
                    <TableCell className="text-gray-500">{rev.product}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 max-w-xs truncate italic">"{rev.comment}"</TableCell>
                    <TableCell>
                      <Badge className={
                        rev.status === 'Approved'
                          ? 'bg-green-50 text-green-700 hover:bg-green-50 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200'
                      }>
                        {rev.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{rev.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        {rev.status === 'Pending' && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
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
