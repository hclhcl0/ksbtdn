import { getPayload } from 'payload';
import configPromise from '@payload-config';

// XML Escaper
function escapeXml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Define base URL for the site
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cdcdanang.vn';
    
    // Fetch articles
    const { docs: articles } = await payload.find({
      collection: 'articles',
      where: {
        _status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 50,
      depth: 1, // depth 1 to get author name and image url
    });

    let rssItems = '';

    for (const article of articles) {
      const url = `${baseUrl}/bai-viet/${article.slug}`;
      const pubDate = new Date(article.publishedAt || article.createdAt).toUTCString();
      const title = escapeXml(article.title || '');
      const description = escapeXml(article.description || '');
      
      // Author name extraction
      let authorName = 'Ban Biên Tập';
      if (article.author && typeof article.author === 'object' && 'name' in article.author) {
        authorName = escapeXml(String(article.author.name) || 'Ban Biên Tập');
      }

      // Image extraction
      let mediaTag = '';
      if (article.image && typeof article.image === 'object' && 'url' in article.image && article.image.url) {
        let imageUrl = article.image.url;
        // Make absolute URL if relative
        if (imageUrl.startsWith('/')) {
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        imageUrl = escapeXml(imageUrl);
        mediaTag = `\n      <media:content url="${imageUrl}" medium="image" />`;
      }

      rssItems += `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${authorName}]]></dc:creator>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${description}]]></description>${mediaTag}
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Trung tâm Kiểm soát Bệnh tật Đà Nẵng (CDC)</title>
    <link>${baseUrl}</link>
    <description>Kênh thông tin y tế chính thức của Trung tâm Kiểm soát Bệnh tật Đà Nẵng.</description>
    <language>vi</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating feed', { status: 500 });
  }
}
