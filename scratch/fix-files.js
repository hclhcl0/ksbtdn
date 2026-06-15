const fs = require('fs');
const path = require('path');

const srcDir = 'D:/CDC/zalo oa/admin-dashboard/src/app';
const destDir = 'D:/CDC/webcq/next-frontend/src/app/(zalo-admin)/zalo-admin';

const filesToRestore = [
  { src: 'ai-knowledge/page.js', dest: 'ai-knowledge/page.js' },
  { src: 'broadcast/page.js', dest: 'broadcast/page.js' },
  { src: 'followers/page.js', dest: 'followers/page.js' },
  { src: 'settings/users/page.js', dest: 'settings/users/page.js' },
  { src: '../components/NewsManager.js', dest: '../../components/zalo-admin/NewsManager.js' }
];

for (const file of filesToRestore) {
  const srcPath = path.join(srcDir, file.src);
  const destPath = path.join(destDir, file.dest);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace auth
    content = content.replace(/import\s+\{\s*useSession\s*\}\s+from\s+["']next-auth\/react["'];/g, 'import { useSession } from "@/components/zalo-admin/PayloadAuthProvider";');
    
    // Replace API paths if they start with /api/ but not /api/zalo-admin/
    content = content.replace(/(fetch\(\s*[`"'])\/api\/(?!zalo-admin\/)/g, '$1/api/zalo-admin/');
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Restored and fixed ${file.dest}`);
  } else {
    console.log(`Missing source file ${srcPath}`);
  }
}
