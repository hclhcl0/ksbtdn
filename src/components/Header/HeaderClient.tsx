"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import styles from './Header.module.css';

interface SubItem { label: string; url: string; }
interface MenuItem { id?: string; label: string; url?: string; subItems?: SubItem[]; }
interface LogoConfig {
  height: number;
  position: string;
  showSiteName: boolean;
  line1: string;
  line2: string;
  tagline: string;
  bannerImageUrl: string;
  mobileLogoUrl?: string;
  mobileHeight?: number;
  mobileShowSiteName?: boolean;
}
interface SearchConfig {
  position: string;
  style: string;
  width: number;
}
interface Props {
  menuItems: MenuItem[];
  menuPosition: string;
  logoUrl: string;
  logoConfig: LogoConfig;
  searchConfig: SearchConfig;
  hotlinePosition: string;
  siteName: string;
  phone: string;
  actionLink: string;
  socials: { fb?: string; tw?: string; yt?: string; ig?: string; };
}

export const HeaderClient = ({ menuItems, menuPosition, logoUrl, logoConfig, searchConfig, hotlinePosition, siteName, phone, actionLink, socials }: Props) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer when clicking outside the drawer
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        mobileOpen &&
        mobileDrawerRef.current &&
        !mobileDrawerRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (url?: string) => url && (pathname === url || pathname.startsWith(url + '/'));

  const renderHotlineBar = () => (
    <div className={styles.trendingBar}>
      <div className="container flex justify-between items-center">
        {searchConfig.position === 'hotline' ? (
          searchConfig.style === 'inline' ? (
            <div className={styles.searchBarForm}>
              <form action="/search">
                <input
                  type="text"
                  placeholder="Tìm Kiếm"
                  name="q"
                  style={{ width: `${searchConfig.width}px` }}
                />
                <button type="submit" className="btn btn-primary"><Search size={16}/></button>
              </form>
            </div>
          ) : (
            <div className={styles.hotlineSearchBtnWrapper}>
              <button className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Mở tìm kiếm">
                <span style={{ marginRight: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Tìm Kiếm</span>
                <Search size={18} />
              </button>
            </div>
          )
        ) : (
          <div />
        )}
        <div className={styles.hotlineActions}>
          <span className={styles.hotlineLabel}>SỐ ĐIỆN THOẠI TỔNG ĐÀI</span>
          <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.hotlineNumber}>{phone}</a>
          <Link href={actionLink} target="_blank" className={`btn btn-primary ${styles.askBtn}`}>Đặt Câu Hỏi</Link>
        </div>
      </div>
    </div>
  );

  return (
    <header ref={headerRef} className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {hotlinePosition === 'very-top' && renderHotlineBar()}
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className="container flex justify-between items-center">
          <div className={styles.socials}>
            {socials.fb && <Link href={socials.fb} target="_blank" aria-label="Facebook"><FaFacebook size={16} /></Link>}
            {socials.tw && <Link href={socials.tw} target="_blank" aria-label="Twitter"><FaTwitter size={16} /></Link>}
            {socials.yt && <Link href={socials.yt} target="_blank" aria-label="Youtube"><FaYoutube size={16} /></Link>}
            {socials.ig && <Link href={socials.ig} target="_blank" aria-label="Instagram"><FaInstagram size={16} /></Link>}
          </div>
          <div className={styles.authLinks} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {searchConfig.position === 'topbar' && (
              searchConfig.style === 'inline' ? (
                <div className={styles.topbarSearchForm}>
                  <form action="/search">
                    <input
                      type="text"
                      placeholder="Tìm Kiếm..."
                      name="q"
                      style={{ width: `${searchConfig.width}px` }}
                    />
                    <button type="submit" aria-label="Tìm kiếm"><Search size={14}/></button>
                  </form>
                </div>
              ) : (
                <button className={styles.topbarSearchBtn} onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm">
                  <Search size={14} />
                </button>
              )
            )}
            {/* Render Hotline in Top Bar next to Auth Links if hotlinePosition is 'topbar' */}
            {hotlinePosition === 'topbar' && (
              <div className={styles.topbarHotline} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255, 255, 255, 0.25)', paddingLeft: '0.75rem' }}>
                <span className={styles.topbarHotlineLabel} style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.85 }}>TỔNG ĐÀI:</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.topbarHotlineNumber} style={{ backgroundColor: '#ef4444', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{phone}</a>
                <Link href={actionLink} target="_blank" className="btn btn-primary" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}>Đặt Câu Hỏi</Link>
              </div>
            )}
            <Link href="/admin" className="flex items-center gap-1.5" style={{ fontSize: '0.65rem', opacity: 0.9, borderLeft: '1px solid rgba(255, 255, 255, 0.25)', paddingLeft: '0.75rem' }}>
              <LogIn size={12} /> Đăng Nhập / Đăng Ký
            </Link>
          </div>
        </div>
      </div>

      {hotlinePosition === 'above-nav' && renderHotlineBar()}
      {/* Main Nav */}
      <div className={styles.mainNav}>
        <div className={`container ${menuPosition === 'below' ? styles.logoRow : 'flex justify-between items-center'}`}>
          {/* Logo — always shown (left or center) */}
          {menuPosition !== 'left' && (
            <LogoBlock logoUrl={logoUrl} siteName={siteName} logoConfig={logoConfig} styles={styles} />
          )}

          {/* Nav inline (right or left position) */}
          {menuPosition !== 'below' && (
            <NavMenu
              menuItems={menuItems}
              pathname={pathname}
              styles={styles}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              isActive={isActive}
              searchConfig={searchConfig}
              setSearchOpen={setSearchOpen}
            />
          )}

          {/* Logo on the right when menu position=left */}
          {menuPosition === 'left' && (
            <LogoBlock logoUrl={logoUrl} siteName={siteName} logoConfig={logoConfig} styles={styles} />
          )}

          {/* Inline search in main nav if configured */}
          {searchConfig.position === 'navbar' && searchConfig.style === 'inline' && (
            <div className={`${styles.searchBarFormNavbar} ${styles.desktopOnly}`}>
              <form action="/search">
                <input
                  type="text"
                  placeholder="Tìm Kiếm"
                  name="q"
                  style={{ width: `${searchConfig.width}px` }}
                />
                <button type="submit" className="btn btn-primary"><Search size={16}/></button>
              </form>
            </div>
          )}

          {/* Search + Hamburger */}
          <div className={styles.navRight}>
            {searchConfig.position !== 'hidden' && (
              <>
                {/* Desktop search icon (only shown when position=navbar and style=popup) */}
                {searchConfig.position === 'navbar' && searchConfig.style === 'popup' && (
                  <button className={`${styles.searchBtn} ${styles.desktopOnly}`} onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm">
                    <Search size={20} />
                  </button>
                )}
                {/* Mobile search icon (always visible on mobile/tablet) */}
                <button className={`${styles.searchBtn} ${styles.mobileOnly}`} onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm">
                  <Search size={20} />
                </button>
              </>
            )}
            <button
              ref={hamburgerRef}
              className={styles.hamburger}
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nav below (full width bar) */}
        {menuPosition === 'below' && (
          <div className={styles.navBarBelow}>
            <div className="container">
              <NavMenu
                menuItems={menuItems}
                pathname={pathname}
                styles={styles}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                isActive={isActive}
                searchConfig={searchConfig}
                setSearchOpen={setSearchOpen}
              />
            </div>
          </div>
        )}
      </div>

      {hotlinePosition === 'below-nav' && renderHotlineBar()}

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div ref={mobileDrawerRef} className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <span className={styles.mobileDrawerTitle}>MENU</span>
          <button className={styles.mobileDrawerClose} onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item, idx) => {
              const hasDropdown = item.subItems && item.subItems.length > 0;
              const key = item.id || String(idx);
              return (
                <li key={key} className={styles.mobileItem}>
                  <div className={styles.mobileItemRow}>
                    {item.url
                      ? <Link href={item.url} onClick={() => setMobileOpen(false)} className={isActive(item.url) ? styles.activeItem : ''}>{item.label}</Link>
                      : <span>{item.label}</span>
                    }
                    {hasDropdown && (
                      <button onClick={() => setOpenDropdown(openDropdown === key ? null : key)} className={styles.mobileChevron}>
                        <ChevronDown size={16} style={{ transform: openDropdown === key ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                      </button>
                    )}
                  </div>
                  {hasDropdown && openDropdown === key && (
                    <ul className={styles.mobileSubMenu}>
                      {item.subItems!.map((sub, si) => (
                        <li key={si}>
                          <Link
                            href={sub.url}
                            onClick={() => setMobileOpen(false)}
                            className={isActive(sub.url) ? styles.activeItem : ''}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Premium Fullscreen Search Overlay Popup */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)}>
          <button className={styles.closeSearchBtn} onClick={() => setSearchOpen(false)} aria-label="Đóng tìm kiếm">
            <X size={32} />
          </button>
          <div className={styles.searchOverlayContent} onClick={(e) => e.stopPropagation()}>
            <form action="/search" className={styles.searchOverlayForm}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                name="q"
                className={styles.searchOverlayInput}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchOverlaySubmitBtn} aria-label="Tìm kiếm">
                <Search size={28} />
              </button>
            </form>
            <p className={styles.searchOverlayTip}>Nhập nội dung cần tìm kiếm và nhấn Enter để tiếp tục</p>
          </div>
        </div>
      )}
    </header>
  );
};

// ── LogoBlock sub-component ──────────────────────────────────────────────────
function LogoBlock({ logoUrl, siteName, logoConfig, styles }: any) {
  const alignClass =
    logoConfig.position === 'center' ? styles.logoCenter :
    logoConfig.position === 'right'  ? styles.logoRight  : '';

  const showSiteNameClass = logoConfig.mobileShowSiteName ? '' : styles.hideSiteNameOnMobile;

  return (
    <div className={`${styles.logo} ${alignClass}`}>
      <a href="/" className={
        logoConfig.hoverEffect === 'scale-tilt' ? styles.effectScaleTilt :
        logoConfig.hoverEffect === 'glow' ? styles.effectGlow :
        logoConfig.hoverEffect === 'bounce' ? styles.effectBounce : ''
      }>
        <picture>
          {logoConfig.mobileLogoUrl && (
            <source media="(max-width: 1024px)" srcSet={logoConfig.mobileLogoUrl} />
          )}
          <img
            src={logoUrl}
            alt={siteName}
            className={styles.logoImg}
            style={{
              '--logo-height': `${logoConfig.height}px`,
              '--mobile-logo-height': `${logoConfig.mobileHeight || 40}px`
            } as any}
          />
        </picture>
        {logoConfig.showSiteName && (
          <div className={`${styles.logoTextBlock} ${showSiteNameClass}`}>
            {logoConfig.line1 && <span className={styles.logoLine1}>{logoConfig.line1}</span>}
            {logoConfig.line2 && <span className={styles.logoLine2}>{logoConfig.line2}</span>}
            {logoConfig.tagline && <span className={styles.logoTagline}>{logoConfig.tagline}</span>}
          </div>
        )}
      </a>
      {logoConfig.bannerImageUrl && (
        <img
          src={logoConfig.bannerImageUrl}
          alt="Logo banner"
          className={styles.logoBannerImg}
        />
      )}
    </div>
  );
}

// ── Reusable NavMenu sub-component ──────────────────────────────────────────
function NavMenu({ menuItems, pathname, styles, openDropdown, setOpenDropdown, isActive, searchConfig, setSearchOpen }: any) {
  return (
    <nav className={styles.navMenu}>
      <ul>
        {menuItems.map((item: any, idx: number) => {
          const hasDropdown = item.subItems && item.subItems.length > 0;
          const key = item.id || String(idx);
          const active = isActive(item.url);
          return (
            <li
              key={key}
              className={`${hasDropdown ? styles.hasDropdown : ''} ${active ? styles.activeItem : ''}`}
              onMouseEnter={() => hasDropdown && setOpenDropdown(key)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.url ? (
                <a href={item.url} className={hasDropdown ? styles.dropdownToggle : ''}>
                  {item.label}
                  {hasDropdown && <ChevronDown size={14} className={styles.chevron} />}
                </a>
              ) : (
                <span className={styles.dropdownToggle}>
                  {item.label}
                  {hasDropdown && <ChevronDown size={14} className={styles.chevron} />}
                </span>
              )}
              {hasDropdown && (
                <ul className={`${styles.dropdown} ${openDropdown === key ? styles.dropdownOpen : ''}`}>
                  {item.subItems.map((sub: any, si: number) => (
                    <li key={si}>
                      <a href={sub.url} className={isActive(sub.url) ? styles.activeSubItem : ''}>
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {/* Render search to the right of the menu items if search position is 'menu' */}
        {searchConfig && searchConfig.position === 'menu' && (
          <li className={styles.menuSearchItem}>
            {searchConfig.style === 'inline' ? (
              <div className={styles.searchBarFormNavbar}>
                <form action="/search">
                  <input
                    type="text"
                    placeholder="Tìm Kiếm"
                    name="q"
                    style={{ width: `${searchConfig.width}px` }}
                  />
                  <button type="submit" className="btn btn-primary"><Search size={16}/></button>
                </form>
              </div>
            ) : (
              <button className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm">
                <Search size={18} />
              </button>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
