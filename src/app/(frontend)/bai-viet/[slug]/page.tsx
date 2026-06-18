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
import { ArticleReaderTools } from '@/components/ArticleReaderTools';
import type { ReaderToolsConfig } from '@/components/ArticleReaderTools';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { SidebarRenderer } from '@/components/SidebarRenderer';

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
    title: `${docs[0].title} | CDC Đà Nẵng`,
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

  // Fetch sidebar configurations from settings
  let sidebarWidgets: any[] = [];
  let readerToolsConfig: ReaderToolsConfig = {};
  try {
    const globalSettings = await payload.findGlobal({ slug: 'settings', depth: 2 });
    sidebarWidgets = (globalSettings as any).sidebarWidgets || [];
    readerToolsConfig = (globalSettings as any).articleReaderTools || {};
  } catch (err) {
    console.error("Failed to fetch sidebar settings:", err);
  }

  // Fallback default widgets if none are configured in CMS
  if (sidebarWidgets.length === 0) {
    sidebarWidgets = [
      {
        id: 'default-categories',
        blockType: 'categoriesWidget',
        title: 'Chuyên mục',
        limit: 10
      },
      {
        id: 'default-recent',
        blockType: 'recentArticlesWidget',
        title: 'Tin mới cập nhật',
        limit: 5
      }
    ];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        
        {/* Main Content Wrapper - relative for sidebar positioning */}
        <div className="relative">
          {/* Reading Progress Bar */}
          <ReadingProgressBar show={readerToolsConfig.showReadProgress ?? true} />

          <article className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:py-10 md:pl-20 md:pr-10 lg:pr-14 overflow-visible min-w-0">
            
            {/* Desktop Sticky Reader Tools - pinned to left edge inside article card */}
            <div className="hidden md:block absolute top-10 left-4 w-12 h-full z-10">
              <div className="sticky top-28">
                <ArticleReaderTools mode="tools" toolsConfig={readerToolsConfig} />
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4 md:mb-6 overflow-x-auto whitespace-nowrap pb-2">
               <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
               <span className="mx-2 flex-shrink-0">/</span>
               <Link href={`/chuyen-muc/${catSlug}`} className="hover:text-gov-primary transition-colors">{catName}</Link>
            </div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-6 leading-tight break-words">
               {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 border-b border-gray-100 pb-3 mb-3 md:pb-6 md:mb-8">
               <span className="flex items-center gap-1.5">
                   <Calendar size={14} className="md:w-4 md:h-4"/>
                   {new Date((article as any).publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
               </span>
               <span className="flex items-center gap-1.5"><Eye size={14} className="md:w-4 md:h-4"/> {(article as any).views || 0} lượt xem</span>
               {(article as any).author_name && <span className="flex items-center gap-1.5">Tác giả: <span className="font-medium text-gray-700">{(article as any).author_name}</span></span>}
               <Link href={`/chuyen-muc/${catSlug}`} className="bg-gov-secondary/10 text-gov-secondary hover:bg-gov-secondary hover:text-white transition-colors px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium">
                 {catName}
               </Link>
               <div className="ml-auto flex items-center w-full md:w-auto mt-2 md:mt-0">
                 <ArticleReaderTools mode="tts" toolsConfig={readerToolsConfig} />
               </div>
            </div>

            {/* Mobile Reader Tools */}
            <div className="md:hidden mb-4 -mt-1">
              <ArticleReaderTools mode="tools" toolsConfig={readerToolsConfig} />
            </div>

            {/* Main Prose Content */}
            <div className="prose prose-base md:prose-lg max-w-none break-words prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl w-full min-w-0 overflow-hidden">
               {article.content ? (
                  <RichText data={article.content} converters={jsxConverters} />
               ) : (
                  <p>Nội dung đang cập nhật...</p>
               )}
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <SidebarRenderer
          widgets={sidebarWidgets}
          latestArticles={latestArticles}
          categories={categories}
        />
      </div>
    </div>
  );
}
