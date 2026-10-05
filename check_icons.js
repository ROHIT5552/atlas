const fs = require('fs');
const path = require('path');
const lucide = require('./client/node_modules/lucide-react');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      const regex = /import\s*\{([^}]+)\}\s+from\s*['c"]lucide-react['\"]/g;
      let match;
      while ((match = regex.exec(code))) {
        const imported = match[1].replace(/\s+as\s+\W+/g, '').split(',').map(s => s.trim()).filter(Boolean);
        for (const icon of imported) {
          if (!lucide[icon]) {
            console.error('[MISSING ICON]', icon,'in file:', fullPath);
          }
        }
      }
    }
  }
}

Async function main() {
  checkDir(path.join(__dirname, 'client/src'));
  console.log('Finished validating all icon imports.');
}
main();
