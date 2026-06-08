import React from 'react';
import Link from 'next/link';
import { ChevronRight, List } from 'lucide-react';
import Image from 'next/image';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

async function getCategoryNews(categoryId: string | number, limit: number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'articles',
      where: {
        category: {
          equals: categoryId,
        },
      },
      sort: '-createdAt',
      limit: limit,
      depth: 1, // to populate image
    });
    return result.docs;
  } catch (err) {
    console.error('Failed to fetch category news from Payload:', err);
    return [];
  }
}

export default async function CategoryNewsBlock({ data }: { data: any }) {
  // data.categoryInfo is a relation, populated automatically by depth
  const category = data.categoryInfo;
  const categoryId = category?.id;
  const limit = data.limit || 4;

  const news = categoryId ? await getCategoryNews(categoryId, limit) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Khung tiêu đề giống phong cách ksbtdanang.vn */}
      <div className="bg-gov-primary text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center uppercase tracking-wide">
          <List className="w-5 h-5 mr-2" />
          {data.title || category?.name || 'Tin tức chuyên mục'}
        </h2>
        {category && (
          <Link href={`/category/${category.slug || category.id}`} className="text-sm text-blue-100 hover:text-white flex items-center">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="p-5">
        {news.length === 0 ? (
          <div className="text-gray-500 text-sm italic">Đang cập nhật tin tức...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tin nổi bật (Bên trái) */}
            {news[0] && (
              <div className="group cursor-pointer">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                  {news[0].image ? (
                    <Image 
                      src={news[0].image.url} 
                      alt={news[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <h3 className="font-bold text-gov-primary text-lg group-hover:text-gov-secondary transition-colors line-clamp-2">
                  <Link href={`/news/${news[0].slug || news[0].id}`}>{news[0].title}</Link>
                </h3>
                <p className="text-sm text-gray-500 mt-1 mb-2">{new Date(news[0].publishedAt).toLocaleDateString('vi-VN')}</p>
                <p className="text-gray-600 text-sm line-clamp-3">{news[0].description}</p>
              </div>
            )}

            {/* Danh sách tin vắn (Bên phải) */}
            <div className="flex flex-col justify-start space-y-4">
              {news.slice(1).map((item: any) => (
                <div key={item.id} className="group flex items-start border-b border-gray-100 pb-3 last:border-0">
                  <ChevronRight className="w-5 h-5 text-gov-secondary mr-2 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  <div>
                    <Link href={`/news/${item.slug || item.id}`} className="font-semibold text-gray-800 group-hover:text-gov-primary transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
