import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import Script from 'next/script';

import { UploadBlock } from './UploadBlock';

function getGDriveEmbedUrl(url: string): { embedUrl: string; directUrl: string } {
  if (url && url.includes('drive.google.com')) {
    let fileId = '';
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    } else if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }

    if (fileId) {
      return {
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/view`
      };
    }
  }
  return { embedUrl: url, directUrl: url };
}

export const getJsxConverters = (fallbackAlt?: string) => ({ defaultConverters }: any) => ({
  ...defaultConverters,
  upload: ({ node }: any) => <UploadBlock node={node} fallbackAlt={fallbackAlt} />,
  blocks: {
    columnsBlock: ({ node }: any) => {
      const { layout, col1, col2, col3 } = node.fields;

      // Map layout value to CSS class name
      const layoutClassMap: Record<string, string> = {
        half: 'columns-half',
        third: 'columns-third',
        twoThirdsLeft: 'columns-two-thirds-left',
        twoThirdsRight: 'columns-two-thirds-right',
      };
      const layoutClass = layoutClassMap[layout] || 'columns-half';

      return (
        <div className={`columns-block-grid ${layoutClass}`}>
          <div><RichText data={col1} converters={getJsxConverters(fallbackAlt)} /></div>
          <div><RichText data={col2} converters={getJsxConverters(fallbackAlt)} /></div>
          {layout === 'third' && col3 && <div><RichText data={col3} converters={getJsxConverters(fallbackAlt)} /></div>}
        </div>
      );
    },
    videoBlock: ({ node }: any) => {
      const { source, youtubeId, customEmbed } = node.fields;
      if (source === 'youtube' && youtubeId) {
        return <div className="aspect-video my-3 rounded-xl overflow-hidden"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" frameBorder="0" allowFullScreen></iframe></div>;
      }
      if (source === 'custom' && customEmbed) {
         return <div className="aspect-video my-3 rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: customEmbed }} />
      }
      return null;
    },
    pdfBlock: ({ node }: any) => {
      const { source, pdfFile, gdriveUrl, displayMode } = node.fields;
      const url = source === 'upload' ? pdfFile?.url : gdriveUrl;
      if (!url) return null;
      
      const { embedUrl, directUrl } = getGDriveEmbedUrl(url);

      if (displayMode === 'download') {
         return (
           <a 
             href={directUrl} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="inline-block bg-gov-primary text-white px-6 py-3 font-medium rounded-lg my-3 hover:bg-gov-secondary transition-colors"
           >
             Tải xuống tài liệu PDF
           </a>
         );
      }

      const isGDrive = url.includes('drive.google.com');

      return (
        <div className="my-3">
          <div className="aspect-[1/1.4] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative">
            <iframe 
              src={embedUrl} 
              width="100%" 
              height="100%" 
              allow="autoplay"
              style={{ border: 'none' }}
            ></iframe>
          </div>
          {isGDrive && (
            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2 items-center">
              <span>Không hiển thị được tài liệu?</span>
              <a 
                href={directUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
              >
                Mở trực tiếp trong cửa sổ mới ↗
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-gray-500">(Hãy chắc chắn rằng tài liệu đã được bật quyền chia sẻ "Bất kỳ ai có liên kết đều xem được")</span>
            </div>
          )}
        </div>
      );
    },
    galleryBlock: ({ node }: any) => {
      const { images } = node.fields;
      if (!images?.length) return null;

      // Tự động chọn số cột theo số lượng ảnh
      const count = images.length;
      let gridClass = 'grid-cols-1';
      if (count === 2) gridClass = 'grid-cols-1 md:grid-cols-2';
      else if (count >= 3) gridClass = 'grid-cols-2 md:grid-cols-3';

      return (
        <div className={`grid ${gridClass} gap-3 my-3`}>
          {images.map((img: any, i: number) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
              <img
                src={img.image?.url}
                alt={img.caption || ''}
                className="w-full h-auto object-cover"
                style={{ aspectRatio: count === 1 ? 'auto' : '4/3' }}
              />
              {img.caption && (
                <p className="text-xs text-center text-gray-500 py-1.5 px-2 bg-gray-50">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      );
    },
    calloutBlock: ({ node }: any) => {
      const { type, title, content } = node.fields;
      let bg = 'bg-blue-50 border-blue-200 text-blue-900';
      if (type === 'warning') bg = 'bg-yellow-50 border-yellow-200 text-yellow-900';
      if (type === 'danger') bg = 'bg-red-50 border-red-200 text-red-900';
      if (type === 'success') bg = 'bg-green-50 border-green-200 text-green-900';
      return (
        <div className={`p-5 my-3 border rounded-xl ${bg}`}>
          {title && <h4 className="font-bold text-lg mb-2">{title}</h4>}
          <p className="m-0 text-base">{content}</p>
        </div>
      );
    },
    buttonBlock: ({ node }: any) => {
      const { label, url, style, openInNewTab } = node.fields;
      const css = style === 'primary' ? 'bg-gov-primary text-white hover:bg-gov-secondary' : 'border-2 border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white';
      return (
        <div className="my-3">
          <a href={url} target={openInNewTab ? '_blank' : '_self'} className={`inline-block px-8 py-3 rounded-full font-bold transition-all ${css}`}>
            {label}
          </a>
        </div>
      );
    },
    relatedArticlesBlock: ({ node }: any) => {
      const { title, articles } = node.fields;
      if (!articles?.length) return null;
      return (
        <div className="my-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gov-primary">{title}</h3>
          <ul className="space-y-3">
            {articles.map((art: any) => (
               <li key={art.id} className="flex items-start">
                 <span className="text-gov-secondary mr-2 mt-1">▶</span>
                 <a href={`/bai-viet/${art.slug || art.id}`} className="text-gray-800 font-medium hover:text-gov-secondary transition-colors text-lg">{typeof art === 'object' ? art.title : 'Bài viết liên quan'}</a>
               </li>
            ))}
          </ul>
        </div>
      );
    },
    cardBlock: ({ node }: any) => {
      const { image, title, description, linkUrl, linkLabel } = node.fields;
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full my-3 hover:shadow-md transition-shadow">
          {image && typeof image === 'object' && image.url && (
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img src={image.url} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            {description && <p className="text-gray-600 mb-6 flex-grow">{description}</p>}
            {linkUrl && (
              <a href={linkUrl} className="inline-flex items-center mt-auto font-bold text-gov-primary hover:text-gov-secondary transition-colors group">
                {linkLabel || 'Xem thêm'} 
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}
          </div>
        </div>
      );
    },
    tiktokBlock: ({ node }: any) => {
      const { videoId, videoUrl, maxWidth, alignment } = node.fields;
      if (!videoId) return null;

      // Tính toán CSS để căn lề
      const containerStyle: React.CSSProperties = {
        display: 'flex',
        width: '100%',
        margin: '1rem 0',
      };
      
      if (alignment === 'left') {
        containerStyle.justifyContent = 'flex-start';
      } else if (alignment === 'right') {
        containerStyle.justifyContent = 'flex-end';
      } else {
        containerStyle.justifyContent = 'center';
      }

      return (
        <div style={containerStyle}>
          <div style={{ width: '100%', maxWidth: `${maxWidth || 320}px` }}>
            <blockquote
              className="tiktok-embed"
              cite={videoUrl}
              data-video-id={videoId}
              data-embed-type="video"
              style={{ maxWidth: '100%', minWidth: '100%', border: 'none', margin: 0, padding: 0 }}
            >
              <section>
                <a target="_blank" href={videoUrl} rel="noopener noreferrer">Xem TikTok</a>
              </section>
            </blockquote>
            <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
          </div>
        </div>
      );
    },
  }
});
