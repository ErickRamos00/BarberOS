const fs = require('fs');

const fileToFix = 'public/app.js';

// Ler arquivo
let content = fs.readFileSync(fileToFix, 'utf8');

// Mapa de todas as correções necessárias
const fixes = [
  // Emojis checkmark
  ['âœ"', '✓'],
  ['âœ—', '✗'],
  ['âœŽ', '✎'],
  ['âœ•', '✕'],
  
  // Caracteres acentuados
  ['Ã©', 'é'],
  ['Ã§', 'ç'],
  ['Ã³', 'ó'],
  ['Ã£', 'ã'],
  ['Ã¡', 'á'],
  ['Ã­', 'í'],
  ['Ã µ', 'õ'],
  ['Ãº', 'ú'],
  
  // Outros símbolos
  ['Â·', '·'],
  ['â†'', '↑'],
  
  // Emojis grandes
  ['ðŸ"…', '📋'],
  ['ðŸ'°', '💰'],
  ['ðŸ"Š', '📊'],
  ['ðŸ'¸', '💸'],
];

// Aplicar todas as correções
let totalFixes = 0;
fixes.forEach(([old, newText]) => {
  const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = (content.match(regex) || []).length;
  
  if (matches > 0) {
    console.log(`  ${old} → ${newText}: ${matches} ocorrência(s)`);
    content = content.replace(regex, newText);
    totalFixes += matches;
  }
});

// Salvar arquivo corrigido
fs.writeFileSync(fileToFix, content, 'utf8');
console.log(`\n✅ Total de ${totalFixes} correções realizadas em ${fileToFix}`);
