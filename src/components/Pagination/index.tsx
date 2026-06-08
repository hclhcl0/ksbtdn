'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  hasPrevPage,
  hasNextPage,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-6">
      {hasPrevPage ? (
        <Link href={createPageURL(currentPage - 1)} className="p-2 rounded-md border border-gray-200 hover:bg-gov-primary hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <button disabled className="p-2 rounded-md border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronLeft size={20} />
        </button>
      )}

      <span className="text-sm font-medium px-4 py-2 border border-gray-200 rounded-md bg-gray-50">
        Trang {currentPage} / {totalPages}
      </span>

      {hasNextPage ? (
        <Link href={createPageURL(currentPage + 1)} className="p-2 rounded-md border border-gray-200 hover:bg-gov-primary hover:text-white transition-colors">
          <ChevronRight size={20} />
        </Link>
      ) : (
        <button disabled className="p-2 rounded-md border border-gray-100 text-gray-300 cursor-not-allowed">
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
