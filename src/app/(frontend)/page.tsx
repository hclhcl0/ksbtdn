export const dynamic = 'force-dynamic';

import React from 'react'
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarousel } from '@/components/HeroCarousel'
import { NewsGrid } from '@/components/NewsGrid'
import { RichText } from '@payloadcms/richtext-lexical/react';
import { jsxConverters } from '@/components/LexicalConverters';

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: 'settings', depth: 1 });
  const homeCategories = settings?.homeCategories || [];
  const homeContent = settings?.homeContent;

  return (
    <>
      <HeroCarousel />
      
      {homeContent && (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="prose prose-lg max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl">
             <RichText data={homeContent} converters={jsxConverters} />
          </div>
        </div>
      )}

      <NewsGrid />

      {homeCategories.map((item: any, index: number) => {
        if (!item.category) return null;
        
        // category could be string ID or populated object depending on depth.
        // Since depth=1, it should be an object.
        const catObj = typeof item.category === 'object' ? item.category : null;
        const catId = catObj ? catObj.id : item.category;
        const catName = catObj ? catObj.name : 'Chuyên mục';
        const catSlug = catObj ? catObj.slug : '';
        
        return (
          <NewsGrid 
            key={`${catId}-${index}`}
            categoryId={catId} 
            categoryName={catName} 
            categorySlug={catSlug}
            limitOverride={item.limit}
          />
        );
      })}
    </>
  )
}
