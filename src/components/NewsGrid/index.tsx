import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Eye, Calendar } from 'lucide-react';
import styles from './NewsGrid.module.css';

interface NewsGridProps {
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  limitOverride?: number;
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
      homeCategories: settings?.homeCategories || []
    };
  } catch(e) {
    return { limit: 10, desktopCols: 5, mobileCols: 2, homeCategories: [] };
  }
}

export const NewsGrid = async ({ categoryId, categoryName, categorySlug, limitOverride }: NewsGridProps) => {
  const { limit: defaultRows, desktopCols, mobileCols } = await getNewsSettings();
  const rows = limitOverride || defaultRows;
  const actualLimit = rows * desktopCols;
  const articles = await getLatestArticles(actualLimit, categoryId);
  
  const title = categoryName ? categoryName.toUpperCase() : 'THÔNG TIN MỚI NHẤT';

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
        
        <div 
          className={styles.grid} 
          style={{ 
            '--desktop-cols': desktopCols,
            '--mobile-cols': mobileCols
          } as React.CSSProperties}
        >
          {articles.map((article: any) => {
            const mediaUrl = article.image?.url || 'https://via.placeholder.com/800x450?text=HCDC';
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
      </div>
    </section>
  );
};
