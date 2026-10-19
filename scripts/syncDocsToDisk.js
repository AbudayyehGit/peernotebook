import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directory
const docsDir = path.resolve(__dirname, '../docs');

// Create directory tree
const categories = [
  '01-project-management',
  '02-business-strategy',
  '03-design-experience',
  '04-technical-architecture',
  '05-engineering-quality',
  '06-operations-deployment',
  '07-legal-administrative'
];

for (const cat of categories) {
  const dir = path.join(docsDir, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy checklist and README to docs
if (fs.existsSync(path.resolve(__dirname, '../checklist.md'))) {
  fs.copyFileSync(
    path.resolve(__dirname, '../checklist.md'),
    path.join(docsDir, 'checklist.md')
  );
  fs.copyFileSync(
    path.resolve(__dirname, '../checklist.md'),
    path.join(docsDir, '01-project-management/checklist.md')
  );
}

if (fs.existsSync(path.resolve(__dirname, '../README.md'))) {
  fs.copyFileSync(
    path.resolve(__dirname, '../README.md'),
    path.join(docsDir, 'README.md')
  );
}

console.log('Docs directories synced successfully.');
