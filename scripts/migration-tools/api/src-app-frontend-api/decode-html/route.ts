import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

function decodeHTMLEntities(text: string) {
    if (!text) return text;
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x3A;': ':',
        '&#x3a;': ':',
        '&ldquo;': '“',
        '&rdquo;': '”',
        '&lsquo;': '‘',
        '&rsquo;': '’',
        '&ndash;': '–',
        '&mdash;': '—',
        '&hellip;': '…'
    };
    return text.replace(/&[#a-zA-Z0-9]+;/g, (match) => {
        if (entities[match]) return entities[match];
        if (match.startsWith('&#x')) {
            return String.fromCharCode(parseInt(match.slice(3, -1), 16));
        }
        if (match.startsWith('&#')) {
            return String.fromCharCode(parseInt(match.slice(2, -1), 10));
        }
        return match;
    });
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Fetch all articles
    const { docs } = await payload.find({ collection: 'articles', limit: 1000 });
    let count = 0;

    for (const article of docs) {
        let updated = false;
        let updateData: any = {};

        const decodedTitle = decodeHTMLEntities(article.title || '');
        if (decodedTitle !== article.title) {
            updateData.title = decodedTitle;
            updated = true;
        }

        if (article.description) {
            const decodedDesc = decodeHTMLEntities(article.description);
            if (decodedDesc !== article.description) {
                updateData.description = decodedDesc;
                updated = true;
            }
        }

        if (article.content && article.content.root && Array.isArray(article.content.root.children)) {
            // We clone the content
            const contentClone = JSON.parse(JSON.stringify(article.content));
            let contentUpdated = false;

            for (const block of contentClone.root.children) {
                if (block.type === 'paragraph' && Array.isArray(block.children)) {
                    for (const node of block.children) {
                        if (node.type === 'text' && typeof node.text === 'string') {
                            const decodedText = decodeHTMLEntities(node.text);
                            if (decodedText !== node.text) {
                                node.text = decodedText;
                                contentUpdated = true;
                            }
                        }
                    }
                }
            }

            if (contentUpdated) {
                updateData.content = contentClone;
                updated = true;
            }
        }

        if (updated) {
            try {
                await payload.update({
                    collection: 'articles',
                    id: article.id,
                    data: updateData
                });
                count++;
            } catch(e) {}
        }
    }

    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
