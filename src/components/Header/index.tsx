import React from 'react';
import Link from 'next/link';
import { Search, LogIn } from 'lucide-react';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeaderClient } from './HeaderClient';
import styles from './Header.module.css';

export const Header = async () => {
  const payload = await getPayload({ config: configPromise });
  const globalHeader = await payload.findGlobal({ slug: 'header', depth: 2 });
  const menuItems = globalHeader.menuItems || [];
  const menuPosition = (globalHeader as any).menuPosition || 'right';
  const lc = (globalHeader as any).logoCustomization || {};
  const logoConfig = {
    height: lc.logoHeight || 52,
    position: lc.logoPosition || 'left',
    showSiteName: lc.showSiteName !== false,
    line1: lc.siteNameLine1 || 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
    line2: lc.siteNameLine2 || 'THÀNH PHỐ ĐÀ NẴNG',
    tagline: lc.siteTagline || '',
    bannerImageUrl: (lc.logoBannerImage as any)?.url || '',
    mobileLogoUrl: (lc.mobileLogo as any)?.url || '',
    mobileHeight: lc.mobileLogoHeight || 40,
    mobileShowSiteName: lc.mobileShowSiteName === true,
    hoverEffect: lc.logoHoverEffect || 'scale-tilt',
  };

  const sc = (globalHeader as any).searchCustomization || {};
  const searchConfig = {
    position: sc.position || 'hotline',
    style: sc.style || 'inline',
    width: sc.width || 250,
  };

  const fb = globalHeader.socialLinks?.facebook;
  const tw = globalHeader.socialLinks?.twitter;
  const yt = globalHeader.socialLinks?.youtube;
  const ig = globalHeader.socialLinks?.instagram;
  
  const phone = globalHeader.hotline?.phone || '0909 408 895';
  const actionLink = globalHeader.hotline?.actionLink || '#';
  const hotlinePosition = globalHeader.hotline?.position || 'below-nav';
  const logoUrl = (globalHeader.logo as any)?.url || '/logo.png';
  const siteName = globalHeader.siteName || 'CDC Đà Nẵng';

  return (
    <HeaderClient
      menuItems={menuItems}
      menuPosition={menuPosition}
      logoUrl={logoUrl}
      logoConfig={logoConfig}
      searchConfig={searchConfig}
      hotlinePosition={hotlinePosition}
      siteName={siteName}
      phone={phone}
      actionLink={actionLink}
      socials={{ fb, tw, yt, ig }}
    />
  );
};
