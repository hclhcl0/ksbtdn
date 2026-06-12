const fs = require('fs');
const { Client } = require('pg');

function generateSlug(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Better slug generator for Vietnamese
function toSlug(str) {
  if (!str) return '';
  str = str.toLowerCase();     
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/^-+/g, '');
  str = str.replace(/-+$/g, '');
  return str;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function createLexicalJson(htmlContent) {
  const text = stripHtml(htmlContent || '');
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              mode: "normal",
              text: text.substring(0, 5000), // Cap length
              type: "text",
              style: "",
              detail: 0,
              format: 0,
              version: 1
            }
          ]
        }
      ],
      direction: "ltr"
    }
  };
}

async function run() {
  const cats = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
  const news = JSON.parse(fs.readFileSync('news_data.json', 'utf8'));
  
  const client = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5433/webcq' });
  await client.connect();

  try {
    await client.query('BEGIN');
    
    // Insert Categories
    console.log("Inserting categories...");
    for (const cat of cats) {
      const slug = cat.alias || toSlug(cat.title);
      await client.query(`
        INSERT INTO categories (id, name, slug, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [cat.catid, cat.title, slug]);
    }
    
    // Reset sequences for categories
    await client.query("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))");

    // Insert Articles (10 per category)
    console.log("Inserting articles...");
    let articleId = 1;
    
    // Clear old test articles just in case to avoid slug conflicts
    await client.query("DELETE FROM articles");
    
    for (const cat of cats) {
      // Find matching articles
      const catNews = news.filter(n => n.catid === cat.catid).slice(0, 10);
      
      for (const item of catNews) {
        let slug = item.slug || toSlug(item.title);
        slug = slug + '-' + item.id; // ensure unique slug
        const lexicalContent = createLexicalJson(item.bodyhtml);
        
        // Truncate desc
        const desc = item.description ? item.description.substring(0, 250) : '';

        await client.query(`
          INSERT INTO articles (id, title, published_at, slug, category_id, description, content, author_name, views, updated_at, created_at, _status)
          VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, NOW(), NOW(), 'published')
        `, [
          articleId++,
          item.title,
          slug,
          cat.catid,
          desc,
          lexicalContent,
          'Admin',
          Math.floor(Math.random() * 1000)
        ]);
      }
    }
    
    await client.query("SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles))");
    
    await client.query('COMMIT');
    console.log("SUCCESS! Migrated categories and articles.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

run();
