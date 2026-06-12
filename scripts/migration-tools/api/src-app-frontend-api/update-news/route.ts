import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const dataPath = path.join(process.cwd(), 'news_data.json');
    const articles = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let count = 0;
    for (const article of articles) {
        let slug = article.slug || `tin-tuc-${article.id}`;
        const existing = await payload.find({ collection: 'articles', where: { slug: { equals: slug } } });
        
        if (existing.docs.length > 0) {
            // Because NukeViet sometimes escapes HTML strings heavily, we unescape a bit
            let html = article.bodyhtml.replace(/\\"/g, '"').replace(/\\n/g, '\n');
            const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim() || "(Chưa có nội dung chi tiết)";

            const contentBlocks = [
                {
                    type: 'paragraph',
                    format: '',
                    indent: 0,
                    version: 1,
                    children: [
                        {
                            mode: 'normal',
                            text: bodyText,
                            type: 'text',
                            version: 1
                        }
                    ]
                }
            ];

            await payload.update({
                collection: 'articles',
                id: existing.docs[0].id,
                data: {
                    content: { root: { type: 'root', format: '', indent: 0, version: 1, children: contentBlocks } } as any,
                }
            });
            count++;
        }
    }

    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
