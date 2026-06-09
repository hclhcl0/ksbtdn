export const dynamic = 'force-dynamic';

import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import styles from '@/components/NewsGrid/NewsGrid.module.css';

interface PageParams {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata = {
  title: 'Tìm Kiếm | CDC Đà Nẵng',
};

export default async function SearchPage({ searchParams }: PageParams) {
  const { q = '' } = await searchParams;
  const payload = await getPayload({ config: configPromise });

  if (!q) {
    return (
      <div className="container py-8">
        <h1 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>KẾT QUẢ TÌM KIẾM</h1>
        <p>Vui lòng nhập từ khóa vào ô tìm kiếm.</p>
      </div>
    );
  }

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: {
      or: [
        {
          title: {
            like: q,
          },
        },
        {
          description: {
            like: q,
          },
        },
      ],
    },
    sort: '-createdAt',
    limit: 24,
    depth: 1,
  });

  return (
    <div className="container py-8">
      <h1 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
        KẾT QUẢ TÌM KIẾM: "{q}"
      </h1>

      {articles.length === 0 ? (
        <p>Không tìm thấy kết quả nào phù hợp với từ khóa "{q}".</p>
      ) : (
        <div className={styles.grid}>
          {articles.map((article: any) => {
            const mediaUrl = article.image?.url || 'https://via.placeholder.com/800x450?text=CDC+Da+Nang';
            const date = new Date(article.createdAt).toLocaleDateString('vi-VN');
            
            return (
              <article key={article.id} className={styles.card}>
                <div className={styles.imageHolder}>
                  <Link href={`/news/${article.slug || article.id}`}>
                    <img src={mediaUrl} alt={article.title} />
                  </Link>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.title}>
                    <Link href={`/news/${article.slug || article.id}`}>
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
  );
}
