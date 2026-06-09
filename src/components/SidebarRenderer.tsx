import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { TikTokSidebarSlot } from './NewsSidebarLayout/TikTokSidebarSlot';

interface SidebarRendererProps {
  widgets?: any[];
  latestArticles: any[];
  categories: any[];
}

export function SidebarRenderer({ widgets, latestArticles, categories }: SidebarRendererProps) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <aside className="space-y-8 min-w-0 lg:sticky lg:top-8 self-start no-print w-full">
      {widgets.map((widget: any, index: number) => {
        const key = widget.id || index;

        switch (widget.blockType) {
          // 1. Render Chuyên mục
          case 'categoriesWidget':
            const limitCat = widget.limit || 10;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                  {widget.title}
                </h3>
                <ul className="space-y-3 list-none p-0 m-0">
                  {categories.slice(0, limitCat).map((cat: any) => (
                    <li key={cat.id}>
                      <Link href={`/chuyen-muc/${cat.slug || cat.id}`} className="flex items-center gap-2 text-gray-700 hover:text-gov-primary transition-colors group">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gov-primary transition-colors"></span>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 2. Render Bài viết mới
          case 'recentArticlesWidget':
            const limitArt = widget.limit || 5;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                  {widget.title}
                </h3>
                <ul className="space-y-4 list-none p-0 m-0">
                  {latestArticles.slice(0, limitArt).map((post: any) => (
                    <li key={post.id} className="group">
                      <Link href={`/bai-viet/${post.slug || post.id}`} className="block">
                        <h4 className="font-semibold text-gray-800 group-hover:text-gov-primary transition-colors line-clamp-3 text-sm leading-snug">
                          {post.title}
                        </h4>
                        <span className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 3. Render TikTok Embed
          case 'tiktokWidget':
            if (!widget.channel) return null;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {widget.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                    {widget.title}
                  </h3>
                )}
                <TikTokSidebarSlot
                  handle={widget.channel.tiktokHandle}
                  channelName={widget.channel.name}
                  channelUrl={widget.channel.channelUrl}
                  avatarUrl={widget.channel.avatar?.url}
                />
              </div>
            );

          // 4. Render Facebook Page Plugin
          case 'facebookWidget':
            const fbUrl = widget.pageUrl || 'https://www.facebook.com/cdcdanang';
            const fbHeight = widget.height || 350;
            const iframeSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbUrl)}&tabs=timeline&width=340&height=${fbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {widget.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                    {widget.title}
                  </h3>
                )}
                <div className="w-full overflow-hidden flex justify-center">
                  <iframe
                    src={iframeSrc}
                    width="100%"
                    height={fbHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </div>
            );

          // 5. Render Banner Quảng cáo
          case 'bannerWidget':
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                {widget.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                    {widget.title}
                  </h3>
                )}
                <Link 
                  href={widget.linkUrl || '#'} 
                  target={widget.openInNewTab ? '_blank' : '_self'}
                  className="block hover:opacity-95 transition-opacity"
                >
                  <img 
                    src={widget.image?.url} 
                    alt={widget.title || "Banner"} 
                    className="rounded-lg max-w-full h-auto mx-auto shadow-sm" 
                  />
                </Link>
              </div>
            );

          // 6. Render HTML Tùy chỉnh (Dành cho mã nhúng bên thứ 3)
          case 'customHtmlWidget':
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {widget.title && (
                  <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gov-primary inline-block">
                    {widget.title}
                  </h3>
                )}
                <div dangerouslySetInnerHTML={{ __html: widget.htmlContent }} />
              </div>
            );

          default:
            return null;
        }
      })}
    </aside>
  );
}
