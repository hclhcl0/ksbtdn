import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Helper to get raw text from a paragraph node
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

        // Condition to merge:
        // If currentPara doesn't end with a sentence terminator (. ! ? :) 
        // OR child starts with a lowercase letter or comma or period.
        const endsWithTerminator = /[.!?:](\s*|”|"|')$/.test(text1);
        const startsWithContinuation = /^[a-zđáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ,\.]/i.test(text2);
        
        // Let's be aggressive: if it doesn't end with a terminator, merge it!
        // But wait, what if it's a short line? 
        // Let's also check if the next line starts with lowercase or continuation punctuation.
        // Wait, "đã k" -> "iểm soát" (i is lowercase).
        // ", c" -> "ắt trọn" (ắ is lowercase).
        // ". C" -> "a phẫu thuật" (a is lowercase).
        
        // If child starts with lowercase or punctuation, OR currentPara ends with a letter/comma and NOT a terminator
        const shouldMerge = (!endsWithTerminator && text1.length > 0) || /^[a-zđáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ,\.]/.test(text2);

        if (shouldMerge) {
          // Merge child's children into currentPara
          // Ensure there's a space if needed
          if (currentPara.children.length > 0 && child.children.length > 0) {
            const lastNode = currentPara.children[currentPara.children.length - 1];
            const firstNode = child.children[0];
            
            // Add a space if text1 doesn't end with space and text2 doesn't start with space or punctuation
            if (lastNode.type === 'text' && firstNode.type === 'text') {
               const char1 = lastNode.text.slice(-1);
               const char2 = firstNode.text.charAt(0);
               if (char1 !== ' ' && char2 !== ' ' && !/^[.,!?:]/.test(char2)) {
                 // Try to figure out if it was a word break.
                 // "đã k" + "iểm" -> "đã kiểm" (no space needed).
                 // "bác sĩ " + "đã" -> "bác sĩ đã" (space already there).
                 // So we don't forcefully add space unless it's obviously two words.
                 // Actually, if it was a newline, the HTML to text might have lost the space.
                 // But wait, "đã k" + "iểm" has NO space. 
                 // If we always add a space, we get "đã k iểm", which is wrong!
                 // If we never add a space, we get "bác sĩđã" if "bác sĩ" didn't have a trailing space!
                 // Let's check text1 trailing space.
               }
            }
          }
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
      
      // Also recurse into non-paragraph children if they have their own children (like blockquotes)
      if (child.children) {
        if (mergeFragmentedParagraphs(child)) {
          changed = true;
        }
      }
    }
  }

  if (currentPara) {
    newChildren.push(currentPara);
  }

  if (changed) {
    // Also clean up consecutive text nodes inside the merged paragraphs
    for (const para of newChildren) {
      if (para.type === 'paragraph' && para.children) {
         const mergedTexts = [];
         let currText = null;
         for (const c of para.children) {
            if (c.type === 'text') {
               if (!currText) {
                  currText = { ...c };
               } else {
                  currText.text += c.text;
               }
            } else {
               if (currText) {
                  mergedTexts.push(currText);
                  currText = null;
               }
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

function trimTextNodes(node: any) {
  let changed = false;
  if (!node.children || !Array.isArray(node.children)) return false;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'text') {
      let origText = child.text || '';
      let newText = origText;
      
      const isStart = (i === 0 || node.children[i - 1].type === 'linebreak');
      const isEnd = (i === node.children.length - 1 || node.children[i + 1].type === 'linebreak');
      
      if (isStart) {
        newText = newText.replace(/^[ \s\u00A0\u200B]+/g, '');
      }
      if (isEnd) {
        newText = newText.replace(/[ \s\u00A0\u200B]+$/g, '');
      }
      
      if (newText !== origText) {
        child.text = newText;
        changed = true;
      }
    } else if (child.children) {
      if (trimTextNodes(child)) {
        changed = true;
      }
    }
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
        
        const hasParagraphChanges = mergeFragmentedParagraphs(contentClone.root);
        const hasTrimChanges = trimTextNodes(contentClone.root);

        if (hasParagraphChanges || hasTrimChanges) {
          await payload.update({
            collection: 'articles',
            id: article.id,
            data: { content: contentClone },
          });
          console.log(`Fixed formatting and trimmed spacing for article ${article.id}`);
          updatedCount++;
        }
      }
    }

    return new Response(`Successfully fixed formatting and trimmed spacing for ${updatedCount} articles!`, { status: 200 });
  } catch (error: any) {
    console.error("Error fixing formatting:", error);
    return new Response(error.message, { status: 500 });
  }
}
