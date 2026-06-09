import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

const SYNC_SECRET = process.env.PAYLOAD_SECRET || 'YOUR-SUPER-SECRET-KEY';

// Parse YouTube RSS XML thủ công (không cần thư viện ngoài)
function parseYoutubeRSS(xml: string): Array<{
  videoId: string;
  title: string;
  description: string;
  publishedDate: string;
  videoUrl: string;
  thumbnail: string;
}> {
  const entries: any[] = [];

  // Extract all <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const descriptionMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

    if (videoIdMatch && titleMatch) {
      const videoId = videoIdMatch[1].trim();
      entries.push({
        videoId,
        title: titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
        description: descriptionMatch
          ? descriptionMatch[1].trim().slice(0, 500).replace(/&amp;/g, '&')
          : '',
        publishedDate: publishedMatch ? publishedMatch[1].trim() : new Date().toISOString(),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }
  }

  return entries;
}

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra secret key để bảo vệ endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: configPromise });

    // Lấy tất cả kênh YouTube có channelId
    const { docs: youtubeChannels } = await payload.find({
      collection: 'video-channels',
      where: {
        and: [
          { platform: { equals: 'youtube' } },
          { channelId: { exists: true } },
        ],
      },
      limit: 50,
    });

    if (youtubeChannels.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có kênh YouTube nào có Channel ID. Hãy thêm Channel ID vào kênh trong CMS.',
        added: 0,
        skipped: 0,
      });
    }

    let totalAdded = 0;
    let totalSkipped = 0;
    const results: any[] = [];

    for (const channel of youtubeChannels) {
      const channelId = channel.channelId as string;
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      try {
        const rssResponse = await fetch(rssUrl, {
          next: { revalidate: 0 },
        });

        if (!rssResponse.ok) {
          results.push({
            channel: channel.name,
            error: `Không thể tải RSS: HTTP ${rssResponse.status}. Kiểm tra lại Channel ID.`,
          });
          continue;
        }

        const rssXml = await rssResponse.text();
        const videos = parseYoutubeRSS(rssXml);

        let channelAdded = 0;
        let channelSkipped = 0;

        for (const video of videos) {
          // Kiểm tra video đã tồn tại chưa (theo videoUrl)
          const { docs: existing } = await payload.find({
            collection: 'videos',
            where: { videoUrl: { equals: video.videoUrl } },
            limit: 1,
          });

          if (existing.length > 0) {
            channelSkipped++;
            continue;
          }

          // Thêm video mới vào CMS
          await payload.create({
            collection: 'videos',
            data: {
              title: video.title,
              platform: 'youtube',
              channel: channel.id,
              videoUrl: video.videoUrl,
              description: video.description,
              publishedDate: video.publishedDate,
              featured: false,
            },
          });

          channelAdded++;
        }

        totalAdded += channelAdded;
        totalSkipped += channelSkipped;

        results.push({
          channel: channel.name,
          channelId,
          totalVideos: videos.length,
          added: channelAdded,
          skipped: channelSkipped,
        });
      } catch (channelError) {
        results.push({
          channel: channel.name,
          error: `Lỗi khi đồng bộ: ${channelError}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đồng bộ hoàn tất! Đã thêm ${totalAdded} video mới, bỏ qua ${totalSkipped} video đã có.`,
      totalAdded,
      totalSkipped,
      channels: results,
    });
  } catch (error) {
    console.error('Sync YouTube error:', error);
    return NextResponse.json(
      { success: false, error: `Lỗi server: ${error}` },
      { status: 500 }
    );
  }
}

// GET endpoint để dễ kiểm tra qua trình duyệt (chỉ dùng khi dev)
export async function GET(request: NextRequest) {
  // Cho phép gọi GET nếu có đúng query param (tiện cho dev)
  const url = new URL(request.url);
  if (url.searchParams.get('secret') !== SYNC_SECRET) {
    return NextResponse.json({ error: 'Cần truyền ?secret=... để xác thực' }, { status: 401 });
  }

  // Chuyển sang POST request nội bộ
  const postRequest = new Request(request.url, {
    method: 'POST',
    headers: { authorization: `Bearer ${SYNC_SECRET}` },
  });
  return POST(postRequest as NextRequest);
}
