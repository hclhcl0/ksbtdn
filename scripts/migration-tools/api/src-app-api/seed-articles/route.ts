import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

export const maxDuration = 300;

function toSlug(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a')
    .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
    .replace(/[íìỉĩị]/g, 'i')
    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
    .replace(/[úùủũụưứừửữự]/g, 'u')
    .replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function extractNodes(element: any, nodes: any[], payload: any) {
  if (element.nodeType === 3) {
    const text = element.rawText;
    // Don't completely trim if there's space, but skip empty whitespace nodes
    if (text.trim()) {
      nodes.push({
        type: 'paragraph', format: '', indent: 0, version: 1,
        children: [{ type: 'text', text: text, format: 0, style: '', detail: 0, mode: 'normal', version: 1 }]
      });
    }
  } else if (element.nodeType === 1) {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'img') {
      let src = element.getAttribute('src') || '';
      src = src.replace(/\\"/g, '').replace(/"/g, '').replace(/\\/g, '');
      const alt = element.getAttribute('alt') || 'image';
      
      try {
        const localPath = `C:/Users/SingPC/public_html${src.split('?')[0]}`;
        const fileName = path.basename(localPath) || 'image.jpg';
        let buffer;
        let mimeType = 'image/jpeg';
        
        if (fileName.endsWith('.png')) mimeType = 'image/png';
        else if (fileName.endsWith('.gif')) mimeType = 'image/gif';
        else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
        else if (fileName.endsWith('.svg')) mimeType = 'image/svg+xml';

        try {
          // Read from the old local PHP source code
          buffer = fs.readFileSync(localPath);
        } catch (e) {
          console.log(`Image not found locally at ${localPath}, using placeholder...`);
          const response = await fetch('https://picsum.photos/600/400.jpg');
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        }
          
          const mediaDoc = await payload.create({
            collection: 'media',
            data: { alt: alt },
            file: {
              data: buffer,
              mimetype: mimeType,
              name: fileName,
              size: buffer.length
            }
          });

          nodes.push({
            type: 'upload',
            format: '',
            version: 1,
            relationTo: 'media',
            value: mediaDoc.id
          });
      } catch (error) {
        console.error("Error fetching/uploading image:", src, error);
      }
    } else if (tagName === 'br') {
      nodes.push({ type: 'linebreak', version: 1 });
    } else {
      // Phân tích đệ quy cho các thẻ như p, div, span, strong
      const childrenNodes: any[] = [];
      for (const child of element.childNodes) {
        await extractNodes(child, childrenNodes, payload);
      }
      
      // Nếu là thẻ p hoặc div, nhóm children vào 1 paragraph
      if ((tagName === 'p' || tagName === 'div' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') && childrenNodes.length > 0) {
        const flatChildren: any[] = [];
        const rootLevelNodes: any[] = [];
        
        for (const c of childrenNodes) {
          if (c.type === 'paragraph' && c.children) {
             flatChildren.push(...c.children);
          } else if (c.type === 'upload') {
             // Upload nodes must be at root level, not inside paragraph
             rootLevelNodes.push(c);
          } else {
             flatChildren.push(c);
          }
        }
        
        if (flatChildren.length > 0) {
          nodes.push({
            type: 'paragraph', format: '', indent: 0, version: 1,
            children: flatChildren
          });
        }
        
        // Push root level nodes (like upload) after the paragraph
        for (const r of rootLevelNodes) {
           nodes.push(r);
        }
      } else {
        for (const c of childrenNodes) {
           if (c.type === 'paragraph') {
             for (const textNode of c.children || []) {
               if (tagName === 'strong' || tagName === 'b') textNode.format = 1;
               if (tagName === 'em' || tagName === 'i') textNode.format = 2;
             }
           }
           nodes.push(c);
        }
      }
    }
  }
}

async function htmlToLexicalNodes(htmlStr: string, payload: any) {
  const root = parse(htmlStr || '');
  const nodes: any[] = [];
  
  for (const child of root.childNodes) {
    await extractNodes(child, nodes, payload);
  }

  if (nodes.length === 0) {
    nodes.push({
      type: 'paragraph', format: '', indent: 0, version: 1,
      children: [{ type: 'text', text: (htmlStr || '').replace(/<[^>]+>/g, ''), format: 0, style: '', detail: 0, mode: 'normal', version: 1 }]
    });
  }
  return nodes;
}

async function createLexicalJson(htmlContent: string, payload: any) {
  const childrenNodes = await htmlToLexicalNodes(htmlContent || '', payload);
  if (htmlContent.includes('<img')) {
     console.log('--- DEBUG LEXICAL WITH IMAGES ---');
     console.dir(childrenNodes, { depth: null });
  }
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1,
      children: childrenNodes
    }
  };
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const catsDataPath = path.resolve(process.cwd(), 'categories.json');
    const newsDataPath = path.resolve(process.cwd(), 'news_data.json');
    
    if (!fs.existsSync(catsDataPath) || !fs.existsSync(newsDataPath)) {
      return NextResponse.json({ error: 'Missing JSON files' }, { status: 404 });
    }
    
    const catsData = JSON.parse(fs.readFileSync(catsDataPath, 'utf8'));
    const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
    
    // Xóa hết danh mục và bài viết cũ
    await payload.delete({ collection: 'articles', where: { id: { exists: true } } });
    await payload.delete({ collection: 'categories', where: { id: { exists: true } } });

    const catIdMap: Record<number, number> = {};
    let count = 0;

    for (const cat of catsData) {
      const slug = cat.alias || toSlug(cat.title);
      try {
        const existingCat = await payload.find({
          collection: 'categories',
          where: { slug: { equals: slug } }
        });
        
        let createdCat;
        if (existingCat.docs.length > 0) {
          createdCat = existingCat.docs[0];
        } else {
          createdCat = await payload.create({
            collection: 'categories',
            data: {
              name: cat.title,
              slug: slug,
            }
          });
        }
        catIdMap[cat.catid] = createdCat.id as number;
      } catch(e) {
        console.error("Error creating category:", cat.title, e);
      }
    }

    for (const cat of catsData) {
      const newCatId = catIdMap[cat.catid];
      if (!newCatId) {
         console.log(`Missing newCatId for ${cat.catid} ${cat.title}`);
         continue;
      }

      const catNews = newsData.filter((n: any) => Number(n.catid) === Number(cat.catid)).slice(0, 10);
      console.log(`Cat ${cat.title} has ${catNews.length} articles`);
      
      for (const item of catNews) {
        let slug = item.slug || toSlug(item.title);
        slug = slug + '-' + item.id;
        
        try {
          const desc = (item.description || item.title || '').substring(0, 200);
          await payload.create({
            collection: 'articles',
            data: {
              title: item.title || 'Untitled',
              slug: slug,
              description: desc,
              content: await createLexicalJson(item.bodyhtml, payload) as any,
              author_name: 'Admin',
              views: Math.floor(Math.random() * 1000),
              category: newCatId,
              publishedAt: new Date().toISOString()
            } as any
          });
          count++;
        } catch(e) {
          console.error("Error creating article:", item.title, e);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Đã nạp ${count} bài viết thành công (tối đa 10 bài/chuyên mục). Hình ảnh và text được chuyển đổi sang Lexical thành công.`
    });
  } catch (error: any) {
    console.error('Error seeding articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
