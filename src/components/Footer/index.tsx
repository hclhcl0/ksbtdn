import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import styles from './Footer.module.css';

export const Footer = async () => {
  const payload = await getPayload({ config: configPromise });
  const globalFooter = await payload.findGlobal({ slug: 'footer' });

  const aboutText = globalFooter.aboutText || 'Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng';
  const addressMain = globalFooter.addressMain || '118 Lê Đình Lý, Phường Thanh Khê, Thành phố Đà Nẵng';
  const addressSub = globalFooter.addressSub || '';
  const phone = globalFooter.phone || '0236 3890 407';
  const email = globalFooter.email || 'kiemsoatbenhtat@danang.gov.vn';

  const currentYear = new Date().getFullYear().toString();
  const rawCopyright = globalFooter.copyrightText || '© Bản quyền thuộc về TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG';
  const copyrightText = rawCopyright.replace('{year}', currentYear);
  const designerCredit = globalFooter.designerCredit || 'thiết kế bởi CNTT CDC Đà Nẵng';

  return (
    <footer className={styles.footer}>
      {/* Accent color bar on top */}
      <div className={styles.topAccent} />

      <div className="container">
        <div className={styles.inner}>

          {/* Column 1: Thông tin tổ chức */}
          <div className={styles.col}>
            <h3>Về chúng tôi</h3>
            <p className={styles.orgName}>{aboutText}</p>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={13} />
                <span><strong>Trụ sở chính:</strong> {addressMain}</span>
              </li>
              {addressSub && (
                <li>
                  <MapPin size={13} />
                  <span><strong>Cơ sở 2:</strong> {addressSub}</span>
                </li>
              )}
              <li>
                <Phone size={13} />
                <span>{phone}</span>
              </li>
              <li>
                <Mail size={13} />
                <span>{email}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Liên kết nhanh */}
          <div className={styles.col}>
            <h3>Liên kết nhanh</h3>
            <ul className={styles.quickLinks}>
              {globalFooter.quickLinks && (globalFooter.quickLinks as any[]).length > 0 ? (
                (globalFooter.quickLinks as any[]).map((link: any) => (
                  <li key={link.id}><Link href={link.url}>{link.label}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/">Trang chủ</Link></li>
                  <li><Link href="/gioi-thieu">Giới thiệu</Link></li>
                  <li><Link href="/category/dich-vu">Hoạt động dịch vụ</Link></li>
                  <li><Link href="/category/dao-tao">Công tác đào tạo</Link></li>
                  <li><Link href="/lien-he">Liên hệ - Góp ý</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Mạng xã hội */}
          <div className={styles.col}>
            <h3>Kết nối với chúng tôi</h3>
            <div className={styles.socialList}>
              {globalFooter.socialLinks && (globalFooter.socialLinks as any[]).length > 0 ? (
                (globalFooter.socialLinks as any[]).map((link: any) => {
                  let Icon = Globe;
                  if (link.platform === 'facebook') Icon = FaFacebook;
                  else if (link.platform === 'youtube') Icon = FaYoutube;
                  else if (link.platform === 'tiktok') Icon = FaTiktok;
                  
                  return (
                    <Link key={link.id || link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                      <span className={styles.socialItemIcon}>
                        <Icon size={16} />
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Chưa có kênh mạng xã hội nào.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      <hr className={styles.divider} />

      {/* Copyright bar */}
      <div className={styles.copyright}>
        <div className={`container ${styles.copyrightInner}`}>
          <span>{copyrightText}</span>
          <span>{designerCredit}</span>
        </div>
      </div>
    </footer>
  );
};
