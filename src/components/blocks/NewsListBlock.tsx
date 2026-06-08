import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

async function fetchLatestNews(limit: number) {
  try {
    const res = await fetch(`http://127.0.0.1:1337/api/articles?sort=publishedAt:desc&pagination[limit]=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Failed to fetch news for block:", err);
    return [];
  }
}

export default async function NewsListBlock({ data }: { data: any }) {
  const limit = data.limit || 4;
  const news = await fetchLatestNews(limit);
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center border-b-2 border-gov-primary pb-3 mb-6">
        <h3 className="text-xl font-bold text-gov-primary uppercase tracking-wide">{data.title}</h3>
        <Link href="/news" className="text-sm font-medium text-gray-500 hover:text-gov-secondary transition-colors">
          Xem tất cả &raquo;
        </Link>
      </div>
      <div className="space-y-6">
        {news.map((item: any) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 group cursor-pointer border-b border-gray-50 pb-6 last:border-0 last:pb-0">
            <div className="w-full sm:w-40 h-48 sm:h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
              <div className="w-full h-full bg-gray-200 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-gray-900 group-hover:text-gov-primary text-lg mb-2 leading-tight transition-colors">
                <Link href={`/news/${item.slug}`}>{item.title}</Link>
              </h4>
              <p className="text-xs text-gray-500 mb-2 flex items-center font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gov-secondary"/> {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description || 'Đang cập nhật nội dung...'}
              </p>
            </div>
          </div>
        ))}
        {news.length === 0 && <p className="text-sm text-gray-500">Đang cập nhật tin tức.</p>}
      </div>
    </div>
  );
}
