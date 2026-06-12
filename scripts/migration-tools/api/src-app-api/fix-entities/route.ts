import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Function to decode HTML entities in a string
function decodeEntities(text: string) {
  if (!text) return text;
  return text
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x002F;/g, '/')
    .replace(/&#x25;/g, '%')
    .replace(/&#x0025;/g, '%');
}

// Recursive function to update text nodes in Lexical AST
function cleanNode(node: any) {
  let changed = false;
  if (node.type === 'text' && typeof node.text === 'string') {
    const newText = decodeEntities(node.text);
    if (newText !== node.text) {
      node.text = newText;
      changed = true;
    }
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (cleanNode(child)) {
        changed = true;
      }
    }
  }

  return changed;
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log("Fetching all articles to clean HTML entities...");

    const { docs } = await payload.find({
      collection: 'articles',
      limit: 1000,
      depth: 0,
    });

    let updatedCount = 0;

    for (const article of docs) {
      if (article.content && article.content.root) {
        // Deep clone to avoid mutating the original before we know we need to save
        const contentClone = JSON.parse(JSON.stringify(article.content));
        
        const hasChanges = cleanNode(contentClone.root);

        if (hasChanges || article.title.includes('&')) {
          const updateData: any = {};
          if (hasChanges) {
            updateData.content = contentClone;
          }
          if (article.title.includes('&')) {
            updateData.title = decodeEntities(article.title);
          }

          await payload.update({
            collection: 'articles',
            id: article.id,
            data: updateData,
          });
          console.log(`Cleaned entities for article ${article.id}`);
          updatedCount++;
        }
      }
    }

    return new Response(`Successfully cleaned entities for ${updatedCount} articles!`, { status: 200 });
  } catch (error: any) {
    console.error("Error cleaning entities:", error);
    return new Response(error.message, { status: 500 });
  }
}
