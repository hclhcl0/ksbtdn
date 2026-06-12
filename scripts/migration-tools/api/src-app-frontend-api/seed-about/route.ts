import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Read the extracted about SQL
    const sqlPath = path.join(process.cwd(), 'about_extracted.sql');
    if (!fs.existsSync(sqlPath)) {
        return NextResponse.json({ success: false, error: "about_extracted.sql not found" }, { status: 404 });
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Extract rows from tms_vi_co_cau_to_chuc_rows
    const valuesMatch = sql.match(/INSERT INTO `tms_vi_co_cau_to_chuc_rows` VALUES\s*(.*?);/s);
    if (!valuesMatch) {
        return NextResponse.json({ success: false, error: "No values found in SQL" });
    }
    
    const rawValues = valuesMatch[1];
    const rows = rawValues.split(/\),\s*\n\s*\(/);
    
    let combinedText = "CƠ CẤU TỔ CHỨC TRUNG TÂM KIỂM SOÁT BỆNH TẬT ĐÀ NẴNG\n\n";
    
    const children = [
      {
        type: 'heading',
        tag: 'h2',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            mode: 'normal',
            text: 'Cơ Cấu Tổ Chức - Trung Tâm Kiểm Soát Bệnh Tật Đà Nẵng',
            type: 'text',
            version: 1,
          }
        ]
      }
    ];
    
    for (let row of rows) {
      const titleMatch = row.match(/^\d+,\s*\d+,\s*'((?:[^'\\]|\\.)*)'/);
      if (titleMatch) {
          let title = titleMatch[1].replace(/\\'/g, "'");
          
          const bodyMatch = row.match(/'((?:[^'\\]|\\.)*)',\s*\d+\s*$/);
          let bodyHtml = bodyMatch ? bodyMatch[1].replace(/\\'/g, "'").replace(/\\n/g, "\n") : "";
          
          // Basic strip HTML
          let bodyText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
          // Decode HTML entities roughly
          bodyText = bodyText.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
          
          combinedText += `${title}\n${bodyText}\n\n`;
          
          children.push({
              type: 'heading',
              tag: 'h3',
              format: '',
              indent: 0,
              version: 1,
              children: [
                  {
                      mode: 'normal',
                      text: title,
                      type: 'text',
                      version: 1
                  }
              ]
          });
          
          children.push({
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                  {
                      mode: 'normal',
                      text: bodyText || "(Chưa có thông tin)",
                      type: 'text',
                      version: 1
                  }
              ]
          });
      }
    }
    
    console.log("Seeding Giới thiệu (About) Article...");
    
    // Ensure Category exists
    const categories = await payload.find({
        collection: 'categories',
        where: { name: { equals: 'Giới thiệu' } }
    });
    
    let categoryId;
    if (categories.docs.length > 0) {
        categoryId = categories.docs[0].id;
    } else {
        const cat = await payload.create({
            collection: 'categories',
            data: {
                name: 'Giới thiệu',
                slug: 'gioi-thieu',
            }
        });
        categoryId = cat.id;
    }
    
    // Check if article already exists
    const articles = await payload.find({
        collection: 'articles',
        where: { slug: { equals: 'gioi-thieu-co-cau-to-chuc' } }
    });
    
    const articleData = {
        title: 'Giới thiệu Cơ cấu tổ chức',
        slug: 'gioi-thieu-co-cau-to-chuc',
        category: categoryId,
        description: 'Thông tin giới thiệu về cơ cấu tổ chức của Trung tâm Kiểm soát Bệnh tật Đà Nẵng.',
        content: {
            root: {
                type: 'root',
                format: '',
                indent: 0,
                version: 1,
                children: children
            }
        }
    };
    
    if (articles.docs.length > 0) {
        await payload.update({
            collection: 'articles',
            id: articles.docs[0].id,
            data: articleData as any
        });
    } else {
        await payload.create({
            collection: 'articles',
            data: articleData as any
        });
    }
    
    // Update footer aboutText to a short summary
    const shortSummary = "Trung tâm Kiểm soát bệnh tật (CDC) Đà Nẵng là đơn vị chuyên môn, kỹ thuật tuyến tỉnh, có chức năng tham mưu và tổ chức thực hiện các hoạt động chuyên môn, kỹ thuật, nghiệp vụ về phòng, chống dịch, bệnh truyền nhiễm, bệnh không lây nhiễm...";
    const oldFooter = await payload.findGlobal({ slug: 'footer' });
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        ...oldFooter,
        aboutText: shortSummary,
      }
    });

    return NextResponse.json({ success: true, message: 'Seeded About data successfully!' });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
