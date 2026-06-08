import React from 'react';
import HeroBannerBlock from './HeroBannerBlock';
import NewsListBlock from './NewsListBlock';
import QuickLinksBlock from './QuickLinksBlock';
import AnnouncementBlock from './AnnouncementBlock';
import CategoryNewsBlock from './CategoryNewsBlock';
import VideoBlock from './VideoBlock';
import ExternalLinksBlock from './ExternalLinksBlock';
import GalleryBlock from './GalleryBlock';

export default function BlockRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const blockType = block.blockType || block.__component; // Support both temporarily if needed
        const key = block.id ? `${blockType}-${block.id}` : index.toString();
        switch (blockType) {
          case 'hero-banner':
          case 'shared.hero-banner':
            return <HeroBannerBlock key={key} data={block} />;
          case 'shared.news-list':
            return <NewsListBlock key={key} data={block} />;
          case 'shared.quick-links':
            return <QuickLinksBlock key={key} data={block} />;
          case 'shared.announcement':
            return <AnnouncementBlock key={key} data={block} />;
          case 'category-news':
          case 'shared.category-news':
            return <CategoryNewsBlock key={key} data={block} />;
          case 'shared.video-block':
            return <VideoBlock key={key} data={block} />;
          case 'shared.external-links':
            return <ExternalLinksBlock key={key} data={block} />;
          case 'shared.gallery-block':
            return <GalleryBlock key={key} data={block} />;
          default:
            return (
              <div key={key} className="p-4 border border-red-300 bg-red-50 text-red-500 rounded my-4">
                [BlockRenderer] Component chưa được hỗ trợ: {blockType}
              </div>
            );
        }
      })}
    </>
  );
}
