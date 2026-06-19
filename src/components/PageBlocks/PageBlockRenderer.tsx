import React from 'react';

// Existing block renderers (used in LexicalConverters)
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';

// New page block components
import { PageRichTextBlock } from './RichTextBlock';
import { SectionTitleBlock } from './SectionTitleBlock';
import { CardGridBlock } from './CardGridBlock';
import { StepsBlock } from './StepsBlock';
import { FaqBlock } from './FaqBlock';
import { CtaBannerBlock } from './CtaBannerBlock';
import { EmbedBlock } from './EmbedBlock';
import { DividerBlock } from './DividerBlock';
import { TableBlock } from './TableBlock';

// Existing block components
import HeroBannerBlockComp from '@/components/blocks/HeroBannerBlock';
import CategoryNewsBlockComp from '@/components/blocks/CategoryNewsBlock';
import VideoBlockComp from '@/components/blocks/VideoBlock';
import GalleryBlockComp from '@/components/blocks/GalleryBlock';

interface Props {
  blocks: any[];
}

export function PageBlockRenderer({ blocks }: Props) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block: any, index: number) => {
        const type = block.blockType;
        const key = block.id ? `${type}-${block.id}` : `${type}-${index}`;

        switch (type) {
          // ── Văn bản & Soạn thảo ──
          case 'richTextBlock':
            return <PageRichTextBlock key={key} content={block.content} />;

          case 'sectionTitleBlock':
            return (
              <SectionTitleBlock
                key={key}
                title={block.title}
                subtitle={block.subtitle}
                level={block.level}
                alignment={block.alignment}
                style={block.style}
              />
            );

          case 'calloutBlock': {
            const bgMap: Record<string, string> = {
              info: 'bg-blue-50 border-blue-200 text-blue-900',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
              danger: 'bg-red-50 border-red-200 text-red-900',
              success: 'bg-green-50 border-green-200 text-green-900',
            };
            const bg = bgMap[block.type] || bgMap.info;
            return (
              <div key={key} className={`p-5 my-6 border rounded-xl ${bg}`}>
                {block.title && <h4 className="font-bold text-lg mb-2">{block.title}</h4>}
                <p className="m-0 text-base">{block.content}</p>
              </div>
            );
          }

          // ── Layout ──
          case 'columnsBlock': {
            if (block.layout === 'half') {
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-6">
                  <div><RichText data={block.col1} converters={getJsxConverters('Hình ảnh minh họa')} /></div>
                  <div><RichText data={block.col2} converters={getJsxConverters('Hình ảnh minh họa')} /></div>
                </div>
              );
            }
            if (block.layout === 'third') {
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                  <div><RichText data={block.col1} converters={getJsxConverters('Hình ảnh minh họa')} /></div>
                  <div><RichText data={block.col2} converters={getJsxConverters('Hình ảnh minh họa')} /></div>
                  {block.col3 && (
                    <div><RichText data={block.col3} converters={getJsxConverters('Hình ảnh minh họa')} /></div>
                  )}
                </div>
              );
            }
            return null;
          }

          case 'dividerBlock':
            return <DividerBlock key={key} style={block.style} size={block.size} />;

          // ── Thẻ & Danh sách ──
          case 'cardGridBlock':
            return (
              <CardGridBlock
                key={key}
                columns={block.columns}
                cardStyle={block.cardStyle}
                cards={block.cards || []}
              />
            );

          case 'cardBlock': {
            const { image, title, description, linkUrl, linkLabel } = block;
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow my-6">
                {image?.url && (
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img src={image.url} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  {description && <p className="text-gray-600 mb-6 flex-grow">{description}</p>}
                  {linkUrl && (
                    <a href={linkUrl} className="inline-flex items-center mt-auto font-bold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors group">
                      {linkLabel || 'Xem thêm'}
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  )}
                </div>
              </div>
            );
          }

          case 'stepsBlock':
            return (
              <StepsBlock
                key={key}
                title={block.title}
                layout={block.layout}
                steps={block.steps || []}
              />
            );

          case 'tableBlock':
            return (
              <TableBlock
                key={key}
                title={block.title}
                headers={block.headers}
                rows={block.rows}
                caption={block.caption}
                striped={block.striped}
                bordered={block.bordered}
              />
            );

          // ── Tương tác ──
          case 'faqBlock':
            return <FaqBlock key={key} title={block.title} faqs={block.faqs || []} />;

          case 'buttonBlock': {
            const css = block.style === 'primary'
              ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
              : 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white';
            return (
              <div key={key} className="my-6">
                <a
                  href={block.url}
                  target={block.openInNewTab ? '_blank' : '_self'}
                  className={`inline-block px-8 py-3 rounded-full font-bold transition-all ${css}`}
                >
                  {block.label}
                </a>
              </div>
            );
          }

          case 'ctaBannerBlock':
            return (
              <CtaBannerBlock
                key={key}
                title={block.title}
                description={block.description}
                style={block.style}
                backgroundImage={block.backgroundImage}
                primaryButton={block.primaryButton}
                secondaryButton={block.secondaryButton}
              />
            );

          // ── Phương tiện ──
          case 'videoBlock':
            return <VideoBlockComp key={key} data={block} />;

          case 'tiktokBlock': {
            if (!block.videoId) return null;
            return (
              <div key={key} style={{ display: 'flex', justifyContent: block.alignment === 'left' ? 'flex-start' : block.alignment === 'right' ? 'flex-end' : 'center', width: '100%', margin: '2rem 0' }}>
                <div style={{ width: '100%', maxWidth: `${block.maxWidth || 320}px` }}>
                  <blockquote
                    className="tiktok-embed"
                    cite={block.videoUrl}
                    data-video-id={block.videoId}
                    data-embed-type="video"
                    style={{ maxWidth: '100%', minWidth: '100%', border: 'none', margin: 0, padding: 0 }}
                  >
                    <section>
                      <a target="_blank" href={block.videoUrl} rel="noopener noreferrer">Xem TikTok</a>
                    </section>
                  </blockquote>
                </div>
              </div>
            );
          }

          case 'galleryBlock':
            return <GalleryBlockComp key={key} data={block} />;

          case 'pdfBlock': {
            const pdfUrl = block.source === 'upload' ? block.pdfFile?.url : block.gdriveUrl;
            if (!pdfUrl) return null;
            const isGDrive = pdfUrl.includes('drive.google.com');
            const embedUrl = isGDrive
              ? pdfUrl.replace('/view', '/preview').replace('/edit', '/preview')
              : pdfUrl;
            return (
              <div key={key} className="my-6">
                <div className="aspect-[1/1.4] w-full rounded-xl overflow-hidden border border-gray-200">
                  <iframe src={embedUrl} width="100%" height="100%" style={{ border: 'none' }} allow="autoplay" />
                </div>
                {isGDrive && (
                  <div className="mt-2 text-sm text-gray-500 flex gap-2 items-center flex-wrap">
                    <span>Không hiển thị được?</span>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-semibold hover:underline">
                      Mở trực tiếp ↗
                    </a>
                  </div>
                )}
              </div>
            );
          }

          // ── Nhúng ──
          case 'embedBlock':
            return (
              <EmbedBlock
                key={key}
                title={block.title}
                embedType={block.embedType}
                htmlCode={block.htmlCode}
                googleMapsUrl={block.googleMapsUrl}
                facebookUrl={block.facebookUrl}
                height={block.height}
              />
            );

          // ── Bài viết ──
          case 'relatedArticlesBlock': {
            const { title: rtitle, articles } = block;
            if (!articles?.length) return null;
            return (
              <div key={key} className="my-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-[var(--primary)]">{rtitle}</h3>
                <ul className="space-y-3">
                  {articles.map((art: any) => (
                    <li key={art.id} className="flex items-start">
                      <span className="text-[var(--secondary)] mr-2 mt-1">▶</span>
                      <a href={`/bai-viet/${art.slug || art.id}`} className="text-gray-800 font-medium hover:text-[var(--secondary)] transition-colors">
                        {typeof art === 'object' ? art.title : 'Bài viết liên quan'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          case 'category-news':
          case 'categoryNews':
            return <CategoryNewsBlockComp key={key} data={block} />;

          case 'hero-banner':
            return <HeroBannerBlockComp key={key} data={block} />;

          default:
            if (process.env.NODE_ENV === 'development') {
              return (
                <div key={key} className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-700 text-sm my-3">
                  ⚠️ Block chưa được hỗ trợ: <code>{type}</code>
                </div>
              );
            }
            return null;
        }
      })}
    </>
  );
}
