import React from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

async function getGlobalSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    return await payload.findGlobal({
      slug: 'header',
      depth: 1,
    });
  } catch (err) {
    console.error("Failed to fetch header from Payload:", err);
    return null;
  }
}

export default async function Header() {
  const global = await getGlobalSettings();
  const siteName = global?.siteName || 'Cổng thông tin điện tử';
  
  // Note: Payload Media urls are typically just the local path if stored locally
  // Depending on setup, we might not need localhost prefix if it's served by next.js
  const logoData = global?.logo as any;
  const logoUrl = logoData?.url ? logoData.url : null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar (Cờ đảng, Hotline, Thời gian) - Có thể mở rộng sau */}
      <div className="bg-gov-primary text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>Hotline: 1900 xxxx</div>
          <div>Thứ Sáu, 05/06/2026</div>
        </div>
      </div>

      {/* Main Header (Logo & Tên Cơ Quan) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
            ) : (
              <div className="h-16 w-16 bg-blue-100 text-gov-primary flex items-center justify-center rounded-full font-bold text-xl">
                LOGO
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-red-600 font-bold text-sm tracking-wider uppercase">Sở Y Tế Thành phố Đà Nẵng</span>
              <h1 className="text-gov-primary font-bold text-xl md:text-2xl uppercase">{siteName}</h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary"
              />
              <Search className="absolute right-3 top-2 text-gray-400 w-4 h-4" />
            </div>
            <button className="p-2 text-gov-primary hover:bg-blue-50 rounded-md">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="bg-gov-primary text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex space-x-1 font-medium text-sm">
            <li><Link href="/" className="px-4 py-3 block hover:bg-blue-800 transition-colors bg-blue-800">TRANG CHỦ</Link></li>
            <li><Link href="/about" className="px-4 py-3 block hover:bg-blue-800 transition-colors">GIỚI THIỆU</Link></li>
            <li><Link href="/news" className="px-4 py-3 block hover:bg-blue-800 transition-colors">TIN TỨC - SỰ KIỆN</Link></li>
            <li><Link href="/documents" className="px-4 py-3 block hover:bg-blue-800 transition-colors">VĂN BẢN CHỈ ĐẠO ĐIỀU HÀNH</Link></li>
            <li><Link href="/contact" className="px-4 py-3 block hover:bg-blue-800 transition-colors">LIÊN HỆ</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
