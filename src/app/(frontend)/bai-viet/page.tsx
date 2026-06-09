export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Eye } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Pagination } from '@/components/Pagination';

export const metadata = {
  title: 'Tất cả bài viết | CDC Đà Nẵng',
};

interface PageParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllArticlesPage({ searchParams }: PageParams) {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'articles',
    sort: '-publishedAt',
    limit: 12,
    page: page,
    depth: 1,
  });

  const { docs: articles, totalPages, page: currentPage, hasPrevPage, hasNextPage } = result;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      <div className="flex items-center text-sm text-gray-500 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
        <span className="font-medium text-gov-primary">Tất cả bài viết</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gov-primary mb-8 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
        Tin tức & Hoạt động
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
          Chưa có bài viết nào được cập nhật.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((item: any) => {
               const mediaUrl = item.image?.url || 'https://via.placeholder.com/800x450?text=CDC+Da+Nang';
               const catName = typeof item.category === 'object' && item.category ? (item.category as any).name : 'Tin tức';
               const catSlug = typeof item.category === 'object' && item.category ? (item.category as any).slug : '';
               
               return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="aspect-video bg-gray-100 w-full relative overflow-hidden">
                    <Link href={`/bai-viet/${item.slug || item.id}`}>
                      <img src={mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    {catName && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold text-gov-primary shadow-sm">
                        {catName}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gov-primary transition-colors line-clamp-3 leading-tight">
                      <Link href={`/bai-viet/${item.slug || item.id}`}>
                        {item.title}
                      </Link>
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium mt-auto">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(item.publishedAt || item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1" /> {item.views || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage || 1} 
            hasPrevPage={hasPrevPage} 
            hasNextPage={hasNextPage} 
          />
        </>
      )}
    </div>
  );
}
