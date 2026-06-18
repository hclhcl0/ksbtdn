import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { OrgChart } from '@/components/OrgChart';
import { OrgAccordion } from '@/components/OrgAccordion';

export async function OrgChartPageTemplate({ slug }: { slug: string }) {
  const payload = await getPayload({ config: configPromise });

  const orgUnitsRes = await payload.find({
    collection: 'org-units',
    sort: 'order',
    limit: 100,
    depth: 1,
  });

  let themeColors: Record<string, string> = {};
  try {
    const themeSettings = await payload.findGlobal({ slug: 'theme-settings' });
    themeColors = (themeSettings?.orgColors as Record<string, string>) || {};
  } catch {
    // Dùng màu mặc định nếu chưa có dữ liệu global
  }

  const orgUnits = orgUnitsRes.docs;

  // Render breadcrumb components based on the dynamic slug
  const slugParts = slug.split('/');
  const breadcrumbItems = slugParts.map((part, index) => {
    const isLast = index === slugParts.length - 1;
    const title = part === 'gioi-thieu' ? 'Giới thiệu' : part === 'co-cau-to-chuc' ? 'Cơ cấu tổ chức' : part;
    return (
      <React.Fragment key={index}>
        <span aria-hidden="true">›</span>
        {isLast ? (
          <span aria-current="page">{title}</span>
        ) : (
          <a href={`/${slugParts.slice(0, index + 1).join('/')}`}>{title}</a>
        )}
      </React.Fragment>
    );
  });

  return (
    <main className="co-cau-to-chuc-page">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Trang chủ</a>
            {breadcrumbItems}
          </nav>
          <h1>Cơ cấu Tổ chức</h1>
          <p className="hero-subtitle">Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng</p>
        </div>
      </div>

      <div className="container org-content">
        {/* Section 1: Org Chart */}
        <section className="org-chart-section" aria-labelledby="org-chart-heading">
          <h2 id="org-chart-heading" className="section-title">
            <span className="section-icon" aria-hidden="true">🏛️</span>
            Sơ đồ Tổ chức
          </h2>
          <OrgChart units={orgUnits as any[]} themeColors={themeColors} />
        </section>

        {/* Divider */}
        <div className="section-divider" aria-hidden="true">
          <span>Nhân sự các Phòng / Khoa</span>
        </div>

        {/* Section 2: Accordion */}
        <section className="org-accordion-section" aria-labelledby="org-accordion-heading">
          <h2 id="org-accordion-heading" className="section-title">
            <span className="section-icon" aria-hidden="true">👥</span>
            Danh sách Nhân sự
          </h2>
          <OrgAccordion units={orgUnits as any[]} themeColors={themeColors} />
        </section>
      </div>

      <style>{`
        .co-cau-to-chuc-page {
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-hero {
          background: linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%);
          color: white;
          padding: 3rem 0 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .page-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .page-hero .container {
          position: relative;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          opacity: 0.85;
        }

        .breadcrumb a {
          color: white;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .page-hero h1 {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          margin: 0 0 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .hero-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .org-content {
          padding-top: 2.5rem;
          padding-bottom: 3rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1a237e;
          margin: 0 0 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #1976d2;
        }

        .section-icon {
          font-size: 1.6rem;
        }

        .org-chart-section {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 2rem;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-divider::before,
        .section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .org-accordion-section {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
      `}</style>
    </main>
  );
}
