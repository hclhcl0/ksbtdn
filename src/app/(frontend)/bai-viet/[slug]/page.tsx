export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { headers } from 'next/headers';

import { jsxConverters } from '@/components/LexicalConverters';

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}
export async function generateMetadata({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === 'true';
  const requestHeaders = await headers();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: requestHeaders });
  
  const canPreview = isPreview && user;

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    draft: canPreview ? true : false,
    overrideAccess: canPreview ? true : false,
  });

  if (docs.length === 0) return {};
  
  return {
    title: `${docs[0].title} | HCDC`,
  };
}

export default async function ArticlePage({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === 'true';
  const requestHeaders = await headers();

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: requestHeaders });
  
  const canPreview = isPreview && user;

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
    draft: canPreview ? true : false,
    overrideAccess: canPreview ? true : false,
  });

  if (docs.length === 0) {
    return notFound();
  }

  const article = docs[0];
  const catName = typeof article.category === 'object' && article.category ? (article.category as any).name : 'Tin tức';
  const catSlug = typeof article.category === 'object' && article.category ? (article.category as any).slug : '';
  
  // Fetch latest articles for the sidebar
  const { docs: latestArticles } = await payload.find({
    collection: 'articles',
    sort: '-publishedAt',
    limit: 5,
    where: {
      id: {
        not_equals: article.id,
      }
    }
  });

  // Fetch categories for sidebar
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 20,
    where: {
      parent: { exists: false }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
             <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
             <span className="mx-2 flex-shrink-0">/</span>
             <Link href={`/chuyen-muc/${catSlug}`} className="hover:text-gov-primary transition-colors">{catName}</Link>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
             {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-6 mb-8">
             <span className="flex items-center gap-1.5">
                 <Calendar size={16}/>
                 {new Date((article as any).publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
             </span>
             <span className="flex items-center gap-1.5"><Eye size={16}/> {(article as any).views || 0} lượt xem</span>
             {(article as any).author_name && <span className="flex items-center gap-1.5">Tác giả: <span className="font-medium text-gray-700">{(article as any).author_name}</span></span>}
             <Link href={`/chuyen-muc/${catSlug}`} className="bg-gov-secondary/10 text-gov-secondary hover:bg-gov-secondary hover:text-white transition-colors px-3 py-1 rounded-full text-xs font-medium">
               {catName}
             </Link>
          </div>
          
          <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
             {article.content ? (
                <RichText data={article.content} converters={jsxConverters} />
             ) : (
                <p>Nội dung đang cập nhật...</p>
             )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gov-primary mb-4 border-b-2 border-gov-secondary pb-2 inline-block">Chuyên mục</h3>
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/chuyen-muc/${cat.slug}`} className="text-gray-600 hover:text-gov-primary font-medium flex items-center transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-gov-secondary mr-2"></span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gov-primary mb-4 border-b-2 border-gov-secondary pb-2 inline-block">Tin mới cập nhật</h3>
            <ul className="space-y-4">
              {latestArticles.map(item => (
                <li key={item.id} className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <Link href={`/bai-viet/${item.slug || item.id}`} className="block">
                    <span className="text-sm font-bold text-gray-800 group-hover:text-gov-primary transition-colors line-clamp-3 mb-1">{item.title}</span>
                    <span className="text-xs text-gray-500 flex items-center mt-2"><Calendar size={12} className="mr-1"/> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
