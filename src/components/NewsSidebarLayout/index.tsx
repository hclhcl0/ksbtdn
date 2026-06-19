import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import styles from './NewsSidebarLayout.module.css';
import { TikTokSidebarSlot } from './TikTokSidebarSlot';

interface NewsSidebarLayoutProps {
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  limit?: number;
}

async function getArticles(limit: number, categoryId?: string | number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const query: any = {
      collection: 'articles',
      sort: '-publishedAt',
      limit,
      depth: 1,
    };
    if (categoryId) query.where = { category: { equals: categoryId } };
    const { docs } = await payload.find(query);
    return docs;
  } catch {
    return [];
  }
}

async function getTikTokChannel() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'video-channels',
      where: {
        and: [
          { platform: { equals: 'tiktok' } },
          { tiktokHandle: { exists: true } },
        ],
      },
      limit: 1,
    });
    return docs[0] || null;
  } catch {
    return null;
  }
}

export const NewsSidebarLayout = async ({
  categoryId,
  categoryName,
  categorySlug,
  limit = 8,
}: NewsSidebarLayoutProps) => {
  const [articles, tiktokChannel] = await Promise.all([
    getArticles(limit, categoryId),
    getTikTokChannel(),
  ]);

  const title = categoryName ? categoryName.toUpperCase() : 'THÔNG TIN MỚI NHẤT';

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          {/* Cột TRÁI — Danh sách bài viết */}
          <div className={styles.mainCol}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{title}</h2>
              {categorySlug && (
                <Link href={`/chuyen-muc/${categorySlug}`} className={styles.viewMore}>
                  Xem thêm »
                </Link>
              )}
            </div>

            {articles.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa có bài viết nào.</p>
            ) : (
              <div className={styles.articleList}>
                {/* Bài đầu tiên: hiển thị to (featured) */}
                {articles[0] && (
                  <article className={styles.featuredCard}>
                    <Link href={`/bai-viet/${articles[0].slug || articles[0].id}`} className={styles.featuredImg}>
                      <img
                        src={articles[0].image?.url || 'https://via.placeholder.com/800x450?text=CDC'}
                        alt={articles[0].title}
                      />
                      <span className={styles.catBadge}>
                        {typeof articles[0].category === 'object' ? articles[0].category?.name : 'Tin tức'}
                      </span>
                    </Link>
                    <div className={styles.featuredBody}>
                      <h3 className={styles.featuredTitle}>
                        <Link href={`/bai-viet/${articles[0].slug || articles[0].id}`}>
                          {articles[0].title}
                        </Link>
                      </h3>
                      <div className={styles.meta}>
                        <span><Calendar size={12} /> {new Date(articles[0].publishedAt || articles[0].createdAt).toLocaleDateString('vi-VN')}</span>
                        <span><Eye size={12} /> {articles[0].views || 0}</span>
                      </div>
                    </div>
                  </article>
                )}

                {/* Các bài còn lại: danh sách nhỏ */}
                <div className={styles.smallList}>
                  {articles.slice(1).map((article: any) => (
                    <article key={article.id} className={styles.smallCard}>
                      <Link href={`/bai-viet/${article.slug || article.id}`} className={styles.smallImg}>
                        <img
                          src={article.image?.url || '/logo.png'}
                          alt={article.title}
                        />
                      </Link>
                      <div className={styles.smallBody}>
                        <h4 className={styles.smallTitle}>
                          <Link href={`/bai-viet/${article.slug || article.id}`}>
                            {article.title}
                          </Link>
                        </h4>
                        <span className={styles.smallDate}>
                          <Calendar size={11} />
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột PHẢI — TikTok Sidebar 9:16 */}
          {tiktokChannel && (
            <aside className={styles.sidebar}>
              <TikTokSidebarSlot
                handle={(tiktokChannel as any).tiktokHandle}
                channelName={tiktokChannel.name}
                channelUrl={(tiktokChannel as any).channelUrl}
                avatarUrl={(tiktokChannel as any).avatar?.url}
              />
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};
