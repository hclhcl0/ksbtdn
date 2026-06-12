const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk('.');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('ArticleReaderTools')) {
    console.log(`Found in: ${file}`);
  }
});
