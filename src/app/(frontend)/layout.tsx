import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals-compiled.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

import { getPayload } from "payload";
import configPromise from "@payload-config";

// Tất cả các trang trong route group này sẽ render động (không render tĩnh khi build)
// để tránh lỗi database chưa được khởi tạo trong quá trình build
export const dynamic = 'force-dynamic';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG",
  description: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng",
};

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '0, 122, 140'; // Default rgb for #007a8c
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 122, 140';
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

  const primaryColor = themeConfig?.primaryColor || '#007a8c';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#005a68';
  const secondaryColor = themeConfig?.secondaryColor || '#4999d6';
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <html lang="vi" className={`${roboto.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --primary-dark: ${primaryDarkColor};
              --secondary: ${secondaryColor};
              --primary-rgb: ${primaryRgb};
            }
          `
        }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
