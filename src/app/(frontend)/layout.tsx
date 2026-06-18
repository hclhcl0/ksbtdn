import type { Metadata } from "next";
import "./globals-compiled.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import ChatWidget from "@/components/ChatWidget/ChatWidget";

import { getPayload } from "payload";
import configPromise from "@payload-config";

// Tất cả các trang trong route group này sẽ render động (không render tĩnh khi build)
// để tránh lỗi database chưa được khởi tạo trong quá trình build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG",
  description: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng",
};

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '58, 127, 199';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '58, 127, 199';
}

// Map font value → tên font thực tế (có dấu cách)
function fontValueToName(value: string): string {
  return value.replace(/\+/g, ' ');
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeConfig: any = null;
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'settings' });
    themeConfig = (settings as any)?.themeConfig;
  } catch (e) {
    console.error("Error fetching settings in layout:", e);
  }

  const primaryColor = themeConfig?.primaryColor || '#3a7fc7';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#0055a7';
  const secondaryColor = themeConfig?.secondaryColor || '#4999d6';
  const primaryRgb = hexToRgb(primaryColor);

  // Font
  const fontValue = themeConfig?.fontFamily || 'Inter';
  const fontName = fontValueToName(fontValue);
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontValue}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;

  return (
    <html lang="vi">
      <head>
        {/* Google Fonts - tải font được chọn từ admin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />

        {/* CSS variables: màu sắc + font chữ */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --primary-dark: ${primaryDarkColor};
              --secondary: ${secondaryColor};
              --primary-rgb: ${primaryRgb};
              --font-family: '${fontName}', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
        <ChatWidget />
      </body>
    </html>
  );
}
