import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

function convertLexicalToSlate(node: any): any[] {
    if (!node) return [];

    if (Array.isArray(node)) {
        return node.flatMap(convertLexicalToSlate);
    }

    if (node.type === 'root') {
        const children = convertLexicalToSlate(node.children);
        // Ensure there's at least one block element
        if (children.length === 0) {
            return [{ type: 'p', children: [{ text: '' }] }];
        }
        return children;
    }

    if (node.type === 'paragraph') {
        const children = convertLexicalToSlate(node.children);
        return [{
            type: 'p',
            children: children.length > 0 ? children : [{ text: '' }]
        }];
    }
    
    if (node.type === 'heading') {
        const children = convertLexicalToSlate(node.children);
        return [{
            type: `h${node.tag ? node.tag.replace('h', '') : '2'}`,
            children: children.length > 0 ? children : [{ text: '' }]
        }];
    }

    if (node.type === 'text') {
        return [{ text: node.text || '' }];
    }
    
    if (node.type === 'list') {
         const children = convertLexicalToSlate(node.children);
         return [{
             type: node.listType === 'number' ? 'ol' : 'ul',
             children: children.length > 0 ? children : [{ type: 'li', children: [{ text: '' }] }]
         }];
    }

    if (node.type === 'listitem') {
         const children = convertLexicalToSlate(node.children);
         return [{
             type: 'li',
             children: children.length > 0 ? children : [{ text: '' }]
         }];
    }

    if (node.type === 'linebreak') {
         return [{ text: '\n' }];
    }

    // Default fallback to text if children exist
    if (node.children) {
        return convertLexicalToSlate(node.children);
    }

    return [{ text: '' }];
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Lấy tất cả bài viết
    const articles = await payload.find({
        collection: 'articles',
        limit: 5000, // Đảm bảo lấy hết 3235 bài
        depth: 0,
    });

    let migratedCount = 0;
    const errors = [];

    for (const article of articles.docs) {
        // Nếu content là object và có thuộc tính root, nghĩa là nó đang là định dạng Lexical
        if (article.content && !Array.isArray(article.content) && article.content.root) {
            try {
                const slateData = convertLexicalToSlate(article.content.root);
                
                await payload.update({
                    collection: 'articles',
                    id: article.id,
                    data: {
                        content: slateData as any,
                    }
                });
                migratedCount++;
            } catch (err: any) {
                console.error(`Lỗi convert bài ${article.id}:`, err);
                errors.push({ id: article.id, error: err.message });
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Đã chuyển đổi thành công ${migratedCount} bài viết từ Lexical sang Slate.`,
        totalScanned: articles.docs.length,
        errors
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
