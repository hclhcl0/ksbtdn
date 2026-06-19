export const dynamic = 'force-dynamic';

import React from 'react'
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarousel } from '@/components/HeroCarousel'
import { NewsGrid } from '@/components/NewsGrid'
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';
import { HomeSectionRenderer } from '@/components/HomeSections/HomeSectionRenderer';

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: 'settings', depth: 2 });
  const homeSections = (settings as any)?.homeSections || [];
  const homeContent = settings?.homeContent;

  return (
    <>
      <HeroCarousel />
      
      {homeContent && (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
             <RichText data={homeContent} converters={getJsxConverters('Hình ảnh minh họa trang chủ')} />
          </div>
        </div>
      )}

      {/* Tin mới nhất luôn hiển thị */}
      <NewsGrid />

      {/* Các thành phần tùy chỉnh từ CMS */}
      <HomeSectionRenderer sections={homeSections} />
    </>
  )
}
