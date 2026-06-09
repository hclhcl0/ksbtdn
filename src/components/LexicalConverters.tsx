import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import Script from 'next/script';

import { UploadBlock } from './UploadBlock';

export const jsxConverters = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  upload: ({ node }: any) => <UploadBlock node={node} />,
  blocks: {
    columnsBlock: ({ node }: any) => {
      const { layout, col1, col2, col3 } = node.fields;
      let gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      if (layout === 'third') gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
      else if (layout === 'twoThirdsLeft') gridTemplateColumns = '2fr 1fr';
      else if (layout === 'twoThirdsRight') gridTemplateColumns = '1fr 2fr';

      return (
        <div style={{ display: 'grid', gridTemplateColumns, gap: '1.5rem', margin: '1.5rem 0' }}>
          <div><RichText data={col1} converters={jsxConverters} /></div>
          <div><RichText data={col2} converters={jsxConverters} /></div>
          {layout === 'third' && col3 && <div><RichText data={col3} converters={jsxConverters} /></div>}
        </div>
      );
    },
    videoBlock: ({ node }: any) => {
      const { source, youtubeId, customEmbed } = node.fields;
      if (source === 'youtube' && youtubeId) {
        return <div className="aspect-video my-6 rounded-xl overflow-hidden"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" frameBorder="0" allowFullScreen></iframe></div>;
      }
      if (source === 'custom' && customEmbed) {
         return <div className="aspect-video my-6 rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: customEmbed }} />
      }
      return null;
    },
    pdfBlock: ({ node }: any) => {
      const { source, pdfFile, gdriveUrl, displayMode } = node.fields;
      let url = source === 'upload' ? pdfFile?.url : gdriveUrl;
      if (!url) return null;
      if (displayMode === 'download') {
         return <a href={url} target="_blank" className="inline-block bg-gov-primary text-white px-6 py-3 font-medium rounded-lg my-4 hover:bg-gov-secondary transition-colors">Tải xuống tài liệu PDF</a>;
      }
      return <div className="aspect-[1/1.4] w-full my-6 rounded-xl overflow-hidden border border-gray-200"><iframe src={url} width="100%" height="100%"></iframe></div>;
    },
    galleryBlock: ({ node }: any) => {
      const { images } = node.fields;
      if (!images?.length) return null;
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
          {images.map((img: any, i: number) => (
            <img key={i} src={img.image?.url} alt={img.caption || ''} className="w-full h-48 object-cover rounded-xl border border-gray-100" />
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
        <div className={`p-5 my-6 border rounded-xl ${bg}`}>
          {title && <h4 className="font-bold text-lg mb-2">{title}</h4>}
          <p className="m-0 text-base">{content}</p>
        </div>
      );
    },
    buttonBlock: ({ node }: any) => {
      const { label, url, style, openInNewTab } = node.fields;
      const css = style === 'primary' ? 'bg-gov-primary text-white hover:bg-gov-secondary' : 'border-2 border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white';
      return (
        <div className="my-6">
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
        <div className="my-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full my-6 hover:shadow-md transition-shadow">
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
      let containerStyle: React.CSSProperties = {
        display: 'flex',
        width: '100%',
        margin: '2rem 0',
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
