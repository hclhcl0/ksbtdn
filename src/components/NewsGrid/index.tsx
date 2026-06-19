import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Eye, Calendar } from 'lucide-react';
import styles from './NewsGrid.module.css';
import { NewsGridSliderClient } from './NewsGridSliderClient';

interface NewsGridProps {
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  limitOverride?: number;
  layoutOverride?: string;
}

async function getLatestArticles(limit: number, categoryId?: string | number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const query: any = {
      collection: 'articles',
      sort: '-createdAt',
      limit: limit,
      depth: 1,
    };
    
    if (categoryId) {
        query.where = { category: { equals: categoryId } };
    }
    
    const { docs } = await payload.find(query);
    return docs;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

async function getNewsSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'settings' });
    return {
      limit: settings?.homeNewsLimit || 10,
      desktopCols: settings?.homeNewsColumnsDesktop || 5,
      mobileCols: settings?.homeNewsColumnsMobile || 2,
      homeNewsLayout: settings?.homeNewsLayout || 'grid',
    };
  } catch(e) {
    return { limit: 10, desktopCols: 5, mobileCols: 2, homeNewsLayout: 'grid' };
  }
}

export const NewsGrid = async ({ categoryId, categoryName, categorySlug, limitOverride, layoutOverride }: NewsGridProps) => {
  const { limit: defaultRows, desktopCols, mobileCols, homeNewsLayout } = await getNewsSettings();
  const actualLimit = limitOverride || defaultRows || 8;
  const articles = await getLatestArticles(actualLimit, categoryId);
  
  const title = categoryName ? categoryName.toUpperCase() : 'THÔNG TIN MỚI NHẤT';

  // Determine layout type: layoutOverride takes priority, otherwise falls back to homeNewsLayout (for latest news) or 'grid' (for category page/fallback)
  const layout = layoutOverride || (categoryId ? 'grid' : homeNewsLayout);

  if (!articles || articles.length === 0) {
    return (
      <section className={styles.newsSection}>
        <div className="container">
          <div className="flex justify-between items-center mb-4">
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              {title}
            </h2>
          </div>
          <p>Chưa có bài viết nào.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsSection}>
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            {title}
          </h2>
          {categorySlug && (
            <Link href={`/chuyen-muc/${categorySlug}`} className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Xem thêm &raquo;
            </Link>
          )}
        </div>
        
        {layout === 'slider' ? (
          <NewsGridSliderClient 
            articles={articles} 
            desktopCols={desktopCols} 
            mobileCols={mobileCols} 
          />
        ) : layout === 'list' ? (
          <div className={styles.listContainer}>
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const catName = article.category?.name || 'Tin tức';
              return (
                <article key={article.id} className={styles.listItem}>
                  <div className={styles.listImage}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      <img src={mediaUrl} alt={article.title} />
                    </Link>
                  </div>
                  <div className={styles.listBody}>
                    <h3 className={styles.listTitle}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    {article.description && (
                      <p className={styles.listExcerpt}>{article.description}</p>
                    )}
                    <div className={styles.listMeta}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> 
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> 
                        {article.views || 0}
                      </span>
                      <span className="ml-auto text-[var(--primary)] font-semibold text-xs">{catName}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : layout === 'compact' ? (
          <div className={styles.compactContainer}>
            {articles.map((article: any) => {
              return (
                <div key={article.id} className={styles.compactItem}>
                  <div className={styles.compactTitle}>
                    <span className="text-[var(--primary)] mr-1.5">•</span>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </div>
                  <span className={styles.compactDate}>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : layout === 'featured' ? (
          (() => {
            const featuredArticle = articles[0];
            const sideArticles = articles.slice(1);
            const featuredMediaUrl = featuredArticle.image?.url || '/logo.png';
            const featuredCatName = featuredArticle.category?.name || 'Tin tức';

            return (
              <div className={styles.featuredContainer}>
                {/* Left side: Big Featured Card */}
                <div className={styles.bigCard}>
                  <div className={styles.bigImageHolder}>
                    <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                      <img src={featuredMediaUrl} alt={featuredArticle.title} />
                    </Link>
                    <span className={styles.catBadge}>{featuredCatName}</span>
                  </div>
                  <div className={styles.bigBody}>
                    <h3 className={styles.bigTitle}>
                      <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h3>
                    {featuredArticle.description && (
                      <p className={styles.bigExcerpt}>{featuredArticle.description}</p>
                    )}
                    <div className={styles.bigMeta}>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} /> 
                        {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-2">
                        <Eye size={12} /> 
                        {featuredArticle.views || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: List of side articles */}
                <div className={styles.sideList}>
                  {sideArticles.map((article: any) => {
                    const sideMediaUrl = article.image?.url || '/logo.png';
                    const sideCatName = article.category?.name || 'Tin tức';

                    return (
                      <article key={article.id} className={styles.sideItem}>
                        <div className={styles.sideImage}>
                          <Link href={`/bai-viet/${article.slug || article.id}`}>
                            <img src={sideMediaUrl} alt={article.title} />
                          </Link>
                        </div>
                        <div className={styles.sideBody}>
                          <h4 className={styles.sideTitle}>
                            <Link href={`/bai-viet/${article.slug || article.id}`}>
                              {article.title}
                            </Link>
                          </h4>
                          <div className={styles.sideMeta}>
                            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-[var(--primary)]">{sideCatName}</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : (
          <div 
            className={styles.grid} 
            style={{ 
              '--desktop-cols': desktopCols,
              '--mobile-cols': mobileCols
            } as React.CSSProperties}
          >
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const date = new Date(article.createdAt).toLocaleDateString('vi-VN');
              const catName = article.category?.name || 'Tin tức';
              
              return (
                <article key={article.id} className={styles.card}>
                  <div className={styles.imageHolder}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      <img src={mediaUrl} alt={article.title} />
                    </Link>
                    <span className={styles.catBadge}>{catName}</span>
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className={styles.meta}>
                      <span className="flex items-center gap-2"><Calendar size={12}/> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-2"><Eye size={12}/> {article.views || 0}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
