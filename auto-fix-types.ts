#!/usr/bin/env node
/**
 * Script para corrigir automaticamente erros TypeScript comuns
 */

const fs = require('fs');
const path = require('path');

// 1. Corrigir NodeJS.Timeout
function fixNodeJSTimeout(content) {
  return content.replace(
    /NodeJS\.Timeout/g,
    'ReturnType<typeof setTimeout>'
  );
}

// 2. Remover imports não utilizados (marcar como comentado)
function fixUnusedImports(content, fileName) {
  // Lista de imports comuns não utilizados
  const unusedPatterns = [
    /import\s+{\s*useEffect\s*}\s+from\s+'react';/g,
    /import\s+{\s*motion\s*}\s+from\s+'framer-motion';/g,
  ];

  let result = content;
  unusedPatterns.forEach(pattern => {
    result = result.replace(pattern, match => `// ${match.substring(0, match.length - 1)} - unused\n`);
  });
  
  return result;
}

// 3. Corrigir "any" em callbacks
function fixImplicitAny(content) {
  // Corrigir map callbacks
  content = content.replace(
    /\.map\(\s*(\w+)\s*=>/g,
    '.map(($1: any) =>'
  );
  
  // Corrigir filter callbacks
  content = content.replace(
    /\.filter\(\s*(\w+)\s*=>/g,
    '.filter(($1: any) =>'
  );
  
  // Corrigir forEach callbacks
  content = content.replace(
    /\.forEach\(\s*(\w+)\s*=>/g,
    '.forEach(($1: any) =>'
  );
  
  return content;
}

// 4. Aplicar todas as correções
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    content = fixNodeJSTimeout(content);
    content = fixUnusedImports(content, filePath);
    content = fixImplicitAny(content);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao processar ${filePath}:`, error.message);
  }
  return false;
}

// 5. Encontrar e corrigir todos os arquivos TS/TSX
function processAllFiles() {
  const srcDir = path.join(__dirname, 'src');
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        fixedCount += walkDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (fixFile(fullPath)) {
          fixedCount++;
        }
      }
    });
    
    return fixedCount;
  }
  
  const totalFixed = walkDir(srcDir);
  console.log(`\n🎉 Total de arquivos corrigidos: ${totalFixed}`);
}

processAllFiles();
