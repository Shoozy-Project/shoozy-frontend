'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DataTablePaginationProps {
  /** Current 1-indexed page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Current page size (number of items per page) */
  pageSize: number;
  /** Available page size choices (default: [10, 20, 50, 100]) */
  pageSizeOptions?: number[];
  /** Callback fired when page changes */
  onPageChange: (page: number) => void;
  /** Callback fired when page size changes */
  onPageSizeChange: (pageSize: number) => void;
  /** Optional container CSS overrides */
  className?: string;
  /** Custom label for items (default: "items") */
  itemLabel?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
  itemLabel = 'items',
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const maxButtons = 5;
  const safeTotalPages = Math.max(1, totalPages);

  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > safeTotalPages) {
    endPage = safeTotalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-sm ${className}`}
    >
      {/* Left side: Rows per page + Range count */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] cursor-pointer"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <span className="text-gray-300 hidden sm:inline">|</span>

        <span className="font-medium text-gray-600">
          Showing <span className="font-semibold text-black">{startItem}</span>–
          <span className="font-semibold text-black">{endItem}</span> of{' '}
          <span className="font-semibold text-black">{totalItems}</span> {itemLabel}
        </span>
      </div>

      {/* Right side: Pagination Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40"
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* First Ellipsis */}
        {startPage > 1 && (
          <span className="px-1.5 text-xs text-gray-400 font-mono">…</span>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 min-w-[32px] px-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-[#FF8C00] hover:bg-[#e67e00] text-white border-[#FF8C00]'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Last Ellipsis */}
        {endPage < safeTotalPages && (
          <span className="px-1.5 text-xs text-gray-400 font-mono">…</span>
        )}

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages}
          className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-40"
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
