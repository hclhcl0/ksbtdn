import { getPayload } from 'payload';
import configPromise from '@payload-config';

// 1. Decode HTML entities
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

function cleanTextNodes(node: any) {
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
      if (cleanTextNodes(child)) changed = true;
    }
  }
  return changed;
}

// 2. Merge Fragmented Paragraphs
function getParagraphText(node: any) {
  if (!node || node.type !== 'paragraph' || !node.children) return '';
  return node.children.map((c: any) => c.text || '').join('');
}

function mergeFragmentedParagraphs(rootNode: any) {
  let changed = false;
  if (!rootNode.children || !Array.isArray(rootNode.children)) return false;

  const newChildren = [];
  let currentPara: any = null;

  for (const child of rootNode.children) {
    if (child.type === 'paragraph') {
      if (!currentPara) {
        currentPara = JSON.parse(JSON.stringify(child));
      } else {
        const text1 = getParagraphText(currentPara).trimEnd();
        const text2 = getParagraphText(child).trimStart();
        const endsWithTerminator = /[.!?:](\s*|”|"|')$/.test(text1);
        const shouldMerge = (!endsWithTerminator && text1.length > 0) || /^[a-zđáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ,\.]/.test(text2);

        if (shouldMerge) {
          currentPara.children.push(...child.children);
          changed = true;
        } else {
          newChildren.push(currentPara);
          currentPara = JSON.parse(JSON.stringify(child));
        }
      }
    } else {
      if (currentPara) {
        newChildren.push(currentPara);
        currentPara = null;
      }
      newChildren.push(child);
      if (child.children) {
        if (mergeFragmentedParagraphs(child)) changed = true;
      }
    }
  }
  if (currentPara) newChildren.push(currentPara);

  if (changed) {
    for (const para of newChildren) {
      if (para.type === 'paragraph' && para.children) {
         const mergedTexts = [];
         let currText = null;
         for (const c of para.children) {
            if (c.type === 'text') {
               if (!currText) currText = { ...c };
               else currText.text += c.text;
            } else {
               if (currText) { mergedTexts.push(currText); currText = null; }
               mergedTexts.push(c);
            }
         }
         if (currText) mergedTexts.push(currText);
         para.children = mergedTexts;
      }
    }
    rootNode.children = newChildren;
  }
  return changed;
}

// 3. Remove Empty Spaces
function isEmptyParagraph(node: any) {
  if (node.type !== 'paragraph') return false;
  if (!node.children || node.children.length === 0) return true;
  for (const child of node.children) {
    if (child.type === 'linebreak') continue;
    if (child.type === 'text') {
      if (child.text && child.text.trim().replace(/\u00A0/g, '') !== '') return false;
    } else {
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
    if (child.type === 'linebreak' || isEmptyParagraph(child)) {
      changed = true;
      continue;
    }

    if (child.children && child.type !== 'paragraph') {
       if (removeEmptySpaces(child)) changed = true;
    }

    if (child.type === 'paragraph' && child.children) {
      const cleanedParaChildren = [];
      for (let i = 0; i < child.children.length; i++) {
        const grandChild = child.children[i];
        if (grandChild.type === 'linebreak') {
           if (cleanedParaChildren.length === 0 || i === child.children.length - 1 || cleanedParaChildren[cleanedParaChildren.length - 1].type === 'linebreak') {
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

// 4. Extract Thumbnail
function extractThumbnailId(rootNode: any) {
  let firstImageId = null;
  const findImage = (node: any) => {
    if (node.type === 'upload' && node.value) {
      firstImageId = typeof node.value === 'object' ? node.value.id : node.value;
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findImage(child)) return true;
      }
    }
    return false;
  };
  if (rootNode) findImage(rootNode);
  return firstImageId;
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log("Starting full database cleanup...");

    const { docs } = await payload.find({
      collection: 'articles',
      limit: 5000,
      depth: 0,
      draft: true, // Fetch everything including drafts
    });

    let updatedCount = 0;

    for (const article of docs) {
      const updateData: any = {};
      let needsUpdate = false;

      // Ensure it's published
      if (article._status !== 'published') {
        updateData._status = 'published';
        needsUpdate = true;
      }

      // Fix title entities
      if (article.title && typeof article.title === 'string' && article.title.includes('&')) {
        const newTitle = decodeEntities(article.title);
        if (newTitle !== article.title) {
          updateData.title = newTitle;
          needsUpdate = true;
        }
      }

      // Fix content AST
      if (article.content && article.content.root) {
        const contentClone = JSON.parse(JSON.stringify(article.content));
        
        let c1 = cleanTextNodes(contentClone.root);
        let c2 = mergeFragmentedParagraphs(contentClone.root);
        let c3 = removeEmptySpaces(contentClone.root);

        // Run space remover twice just to be sure
        if (c3) {
            removeEmptySpaces(contentClone.root);
        }

        if (c1 || c2 || c3) {
          updateData.content = contentClone;
          needsUpdate = true;
        }

        // Set Thumbnail if missing
        if (!article.image) {
          const thumbId = extractThumbnailId(updateData.content ? updateData.content.root : article.content.root);
          if (thumbId) {
            updateData.image = thumbId;
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        try {
          await payload.update({
            collection: 'articles',
            id: article.id,
            data: updateData,
          });
          updatedCount++;
          console.log(`Cleaned article ${article.id}`);
        } catch (e: any) {
          console.error(`Error updating article ${article.id}:`, e.message);
        }
      }
    }

    return new Response(`Database cleanup complete! Successfully fixed ${updatedCount} articles.`, { status: 200 });
  } catch (error: any) {
    console.error("Cleanup API Error:", error);
    return new Response(error.message, { status: 500 });
  }
}
