const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'api', 'admin');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  if (!content.includes("import { requireAdmin }")) {
    content = content.replace(/(import { NextResponse } from 'next\/server';)/, "$1\nimport { requireAdmin } from '@/lib/api-auth';");
    changed = true;
  }

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  methods.forEach(method => {
    const regexStr = `export async function ${method}\\(([^)]*)\\) {`;
    const regex = new RegExp(regexStr, 'g');
    const authCheck = `  const admin = await requireAdmin();\n  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n`;
    
    content = content.replace(regex, (match, p1) => {
      // Check if this specific block already has requireAdmin
      const startIndex = content.indexOf(match);
      const nextBlockIndex = content.indexOf('export async function', startIndex + 1);
      const blockContent = nextBlockIndex === -1 ? content.slice(startIndex) : content.slice(startIndex, nextBlockIndex);
      
      if (!blockContent.includes('requireAdmin()')) {
        changed = true;
        return `export async function ${method}(${p1}) {\n${authCheck}`;
      }
      return match;
    });
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file === 'route.ts') {
      processFile(fullPath);
    }
  }
}

walkDir(adminDir);
console.log('Done.');
