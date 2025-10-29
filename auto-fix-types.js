const fs = require('fs');
const path = require('path');

function fixNodeJSTimeout(content) {
  return content.replace(/NodeJS\.Timeout/g, 'ReturnType<typeof setTimeout>');
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    content = fixNodeJSTimeout(content);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
  } catch (error) {
    // silencioso
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      fixedCount += walkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

const srcDir = path.join(__dirname, 'src');
const totalFixed = walkDir(srcDir);
console.log(`\n🎉 Total de arquivos corrigidos: ${totalFixed}`);
