import { getPayload } from 'payload';
import configPromise from '@payload-config';

async function fixArticles() {
  const payload = await getPayload({ config: configPromise });
  console.log("Fetching all articles...");

  const { docs } = await payload.find({
    collection: 'articles',
    limit: 1000,
    depth: 0,
    draft: true, // Find drafts
  });

  console.log(`Found ${docs.length} articles.`);

  for (const article of docs) {
    let firstImageId = null;

    // Traverse the Lexical AST to find the first 'upload' node
    if (article.content && article.content.root) {
      const findImage = (node: any) => {
        if (node.type === 'upload' && node.value) {
          firstImageId = typeof node.value === 'object' ? node.value.id : node.value;
          return true; // Found
        }
        if (node.children) {
          for (const child of node.children) {
            if (findImage(child)) return true;
          }
        }
        return false;
      };
      
      findImage(article.content.root);
    }

    const updateData: any = {
      _status: 'published'
    };

    if (firstImageId && !article.image) {
      updateData.image = firstImageId;
    }

    try {
      await payload.update({
        collection: 'articles',
        id: article.id,
        data: updateData,
      });
      console.log(`Updated article ${article.id} - Set status: published, image: ${firstImageId}`);
    } catch (e: any) {
      console.error(`Failed to update article ${article.id}:`, e.message);
    }
  }

  console.log("Done!");
}

export async function GET() {
  try {
    await fixArticles();
    return new Response('Articles fixed successfully!', { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
