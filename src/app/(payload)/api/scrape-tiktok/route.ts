import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * BƯỚC 1: API cào dữ liệu TikTok ngầm (Server-side)
 * ---------------------------------------------------
 * Giả lập trình duyệt → Fetch trang profile TikTok
 * → Bóc tách ID video mới nhất từ JSON nhúng trong HTML
 * → Lưu vào Settings (Postgres cache) — BƯỚC 2
 *
 * Bảo mật: Chỉ chấp nhận request có header Authorization đúng
 * hoặc header x-vercel-cron (Vercel Cron tự động thêm)
 */

const CRON_SECRET = process.env.CRON_SECRET || process.env.PAYLOAD_SECRET || 'YOUR-SUPER-SECRET-KEY';

// Danh sách User-Agent thực tế để luân phiên
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Bóc tách video ID từ HTML profile TikTok.
 * TikTok nhúng dữ liệu trang vào thẻ script JSON có id="__UNIVERSAL_DATA_FOR_REHYDRATION__"
 */
function extractLatestVideo(html: string): { videoId: string; videoUrl: string; desc: string } | null {
  try {
    // Cách 1: Lấy từ __UNIVERSAL_DATA_FOR_REHYDRATION__ (cấu trúc chính của TikTok web)
    const scriptMatch = html.match(
      /<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
    );

    if (scriptMatch) {
      const jsonData = JSON.parse(scriptMatch[1]);

      // Điều hướng vào cấu trúc dữ liệu TikTok
      const defaultScope = jsonData?.__DEFAULT_SCOPE__;
      const userPost = defaultScope?.['webapp.user-post']?.itemList
        || defaultScope?.['webapp.user-detail']?.userInfo?.stats;

      // Tìm danh sách video
      const itemList = defaultScope?.['webapp.user-post']?.itemList;
      if (itemList && itemList.length > 0) {
        const firstVideo = itemList[0];
        const videoId = firstVideo?.id || firstVideo?.video?.id;
        const authorUniqueId = firstVideo?.author?.uniqueId;
        const desc = firstVideo?.desc || '';

        if (videoId && authorUniqueId) {
          return {
            videoId,
            videoUrl: `https://www.tiktok.com/@${authorUniqueId}/video/${videoId}`,
            desc: desc.slice(0, 200),
          };
        }
      }
    }

    // Cách 2: Fallback — tìm pattern video ID trực tiếp trong HTML
    // TikTok thường có "/video/1234567890" trong href
    const videoIdMatches = html.match(/\/video\/(\d{15,20})/g);
    if (videoIdMatches && videoIdMatches.length > 0) {
      const videoId = videoIdMatches[0].replace('/video/', '');

      // Lấy handle từ URL page
      const handleMatch = html.match(/canonical.*?tiktok\.com\/@([^/"]+)/);
      const handle = handleMatch ? handleMatch[1] : 'unknown';

      return {
        videoId,
        videoUrl: `https://www.tiktok.com/@${handle}/video/${videoId}`,
        desc: '',
      };
    }

    return null;
  } catch (e) {
    console.error('[scrape-tiktok] Parse error:', e);
    return null;
  }
}

async function scrapeTikTok(handle: string) {
  const profileUrl = `https://www.tiktok.com/@${handle}`;

  const response = await fetch(profileUrl, {
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
    // Timeout 15 giây
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`TikTok returned HTTP ${response.status}`);
  }

  const html = await response.text();
  return extractLatestVideo(html);
}

// ─── POST: Vercel Cron hoặc manual trigger ──────────────────────────────────
export async function POST(request: NextRequest) {
  // Xác thực: Vercel Cron tự thêm header này, hoặc manual dùng Authorization
  const cronHeader = request.headers.get('x-vercel-cron');
  const authHeader = request.headers.get('authorization');

  if (!cronHeader && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config: configPromise });

  // Đọc Settings để lấy handle đã cấu hình
  const settings = await payload.findGlobal({ slug: 'settings' });
  const handle = (settings as any)?.tiktokCache?.tiktokHandle;

  if (!handle) {
    return NextResponse.json({
      success: false,
      message: 'Chưa cấu hình TikTok Username trong Settings > TikTok Sidebar Cache.',
    }, { status: 400 });
  }

  console.log(`[scrape-tiktok] Bắt đầu cào dữ liệu kênh @${handle}...`);

  try {
    const video = await scrapeTikTok(handle);

    if (!video) {
      return NextResponse.json({
        success: false,
        message: `Không tìm thấy video nào từ @${handle}. TikTok có thể đang chặn IP hoặc thay đổi cấu trúc HTML.`,
      }, { status: 422 });
    }

    // BƯỚC 2: Lưu cache vào Postgres thông qua Payload CMS
    await payload.updateGlobal({
      slug: 'settings',
      data: {
        tiktokCache: {
          videoId: video.videoId,
          videoUrl: video.videoUrl,
          videoDesc: video.desc,
          updatedAt: new Date().toISOString(),
          tiktokHandle: handle,
        },
      } as any,
    });

    console.log(`[scrape-tiktok] ✅ Đã lưu video mới: ${video.videoId}`);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật video mới nhất từ @${handle}`,
      videoId: video.videoId,
      videoUrl: video.videoUrl,
      desc: video.desc,
      cachedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[scrape-tiktok] Error:', err);
    return NextResponse.json({
      success: false,
      message: `Lỗi khi cào TikTok: ${err?.message || err}`,
    }, { status: 500 });
  }
}

// ─── GET: Trigger thủ công qua trình duyệt (chỉ dùng khi dev/test) ──────────
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({
      error: 'Cần truyền ?secret=... để xác thực. Ví dụ: /api/scrape-tiktok?secret=YOUR-SECRET'
    }, { status: 401 });
  }

  // Chạy POST logic
  const fakePost = new Request(request.url, {
    method: 'POST',
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  });
  return POST(fakePost as NextRequest);
}
