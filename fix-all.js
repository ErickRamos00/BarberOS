const fs = require('fs');

// Arquivo public/app.js
const filePath = 'public/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// Mapa de substituições
const fixes = [
  // Caracteres individuais com encoding incorreto
  ['Ã©', 'é'],
  ['Ã£', 'ã'],
  ['Ã§', 'ç'],
  ['Ã¡', 'á'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã ', 'à'],
  ['Ã‰', 'É'],
  ['Ã', 'Â'],
  ['Ã‡', 'Ç'],
  ['Ã"', 'Õ'],
  ['Â·', '·'],
  ['â€', '–'],
  // Emojis estranhos
  ['âœ"', '✓'],
  ['âœ—', '✗'],
  ['âœ‚', '✂'],
  ['âœ‰', '✉'],
  ['âœŽ', '✎'],
  ['âœ•', '✕'],
  ['ðŸ"…', '📋'],
  ['ðŸ'°', '💰'],
  ['ðŸŽ¯', '🎯'],
  ['ðŸ"Š', '📊'],
  ['ðŸ'¸', '💸'],
  ['â†'', '↑'],
  ['ðŸ"„', '📄'],
];

// Aplicar todas as substituições
let count = 0;
for (const [old, newText] of fixes) {
  const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    count += matches.length;
    content = content.replace(regex, newText);
  }
}

// Salvar arquivo corrigido
fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Corrigidas ${count} ocorrências em ${filePath}`);
