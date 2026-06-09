export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (docs.length === 0) return {};
  
  return {
    title: `${docs[0].name} | CDC Đà Nẵng`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  
  const payload = await getPayload({ config: configPromise });
  
  // 1. Lấy thông tin chuyên mục
  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (categories.length === 0) {
    return notFound();
  }

  const category = categories[0];

  // 2. Lấy bài viết thuộc chuyên mục này (có phân trang)
  const result = await payload.find({
    collection: 'articles',
    where: {
      category: {
         equals: category.id,
      }
    },
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
        <span className="mx-2 flex-shrink-0">/</span>
        <span className="font-medium text-gov-primary">{category.name}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gov-primary mb-8 border-b-2 border-gov-secondary pb-3 inline-block uppercase tracking-wide">
        {category.name}
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
          Chưa có bài viết nào trong chuyên mục này.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || 'https://via.placeholder.com/800x450?text=CDC+Da+Nang';
              
              return (
                <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="aspect-video bg-gray-100 w-full relative overflow-hidden">
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      <img src={mediaUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gov-primary transition-colors line-clamp-3 leading-tight">
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium mt-auto">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1" /> {article.views || 0}</span>
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
