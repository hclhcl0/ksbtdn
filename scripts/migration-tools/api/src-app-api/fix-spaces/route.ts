import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Check if a node is an "empty" paragraph (contains only whitespace or non-breaking spaces)
function isEmptyParagraph(node: any) {
  if (node.type !== 'paragraph') return false;
  if (!node.children || node.children.length === 0) return true;
  
  // If it only has text nodes with spaces or \u00A0, or linebreaks
  for (const child of node.children) {
    if (child.type === 'linebreak') continue;
    if (child.type === 'text') {
      // Check if text is just whitespace or non-breaking space
      if (child.text && child.text.trim().replace(/\u00A0/g, '') !== '') {
        return false;
      }
    } else {
      // If it contains a link, image, or anything else, it's not empty
      return false;
    }
  }
  return true;
}

function removeEmptySpaces(rootNode: any) {
  let changed = false;
  if (!rootNode.children || !Array.isArray(rootNode.children)) return false;

  const newChildren = [];

  for (const child of rootNode.children) {
    // Top-level linebreaks shouldn't exist, but if they do, remove them!
    if (child.type === 'linebreak') {
      changed = true;
      continue;
    }

    if (isEmptyParagraph(child)) {
      changed = true;
      continue;
    }

    // Recurse into blockquote, list, etc.
    if (child.children && child.type !== 'paragraph') {
       if (removeEmptySpaces(child)) {
          changed = true;
       }
    }

    // Inside paragraphs, we can also remove trailing linebreaks or duplicate linebreaks
    if (child.type === 'paragraph' && child.children) {
      const cleanedParaChildren = [];
      for (let i = 0; i < child.children.length; i++) {
        const grandChild = child.children[i];
        
        // Remove duplicate linebreaks or leading/trailing linebreaks
        if (grandChild.type === 'linebreak') {
           // Skip if it's the first child
           if (cleanedParaChildren.length === 0) {
             changed = true;
             continue;
           }
           // Skip if the previous child was also a linebreak
           if (cleanedParaChildren[cleanedParaChildren.length - 1].type === 'linebreak') {
             changed = true;
             continue;
           }
           // Skip if it's the last child
           if (i === child.children.length - 1) {
             changed = true;
             continue;
           }
        }
        
        cleanedParaChildren.push(grandChild);
      }
      
      if (cleanedParaChildren.length !== child.children.length) {
         child.children = cleanedParaChildren;
         changed = true;
      }
    }

    newChildren.push(child);
  }

  if (newChildren.length !== rootNode.children.length) {
    rootNode.children = newChildren;
    changed = true;
  }

  return changed;
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'articles',
      limit: 1000,
      depth: 0,
    });

    let updatedCount = 0;

    for (const article of docs) {
      if (article.content && article.content.root) {
        const contentClone = JSON.parse(JSON.stringify(article.content));
        
        const hasChanges = removeEmptySpaces(contentClone.root);

        if (hasChanges) {
          await payload.update({
            collection: 'articles',
            id: article.id,
            data: { content: contentClone },
          });
          console.log(`Removed empty spaces for article ${article.id}`);
          updatedCount++;
        }
      }
    }

    return new Response(`Successfully removed empty spaces for ${updatedCount} articles!`, { status: 200 });
  } catch (error: any) {
    console.error("Error fixing spaces:", error);
    return new Response(error.message, { status: 500 });
  }
}
