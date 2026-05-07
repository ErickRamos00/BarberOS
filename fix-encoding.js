const fs = require('fs');
const path = require('path');

const files = [
  'app.js',
  'public/app.js',
  'public/booking-functions.js'
];

const replacements = {
  'Ã©': 'é',
  'Ã£': 'ã',
  'Ã§': 'ç',
  'Ã¡': 'á',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã ': 'à',
  'Ã‰': 'É',
  'Ã‚': 'Â',
  'Ã‡': 'Ç',
  'Ã"': 'Õ',
  'Â·': '·',
  'â€': '–',
  'âœ"': '✓',
  'âœ—': '✗',
  'âœ‚': '✂',
  'âœ‰': '✉',
  'âœŽ': '✎',
  'âœ•': '✕',
  'ðŸ"…': '📋'
};

console.log('Iniciando correção de encoding UTF-8...\n');

let totalReplacements = 0;
let filesProcessed = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processando: ${file}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    for (const [old, newVal] of Object.entries(replacements)) {
      const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        const count = matches.length;
        console.log(`  ${old} → ${newVal}: ${count} ocorrência(s)`);
        content = content.replace(regex, newVal);
        fileReplacements += count;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${file}: ${fileReplacements} substituições realizadas\n`);
    
    filesProcessed++;
    totalReplacements += fileReplacements;
  } else {
    console.log(`✗ Arquivo não encontrado: ${file}\n`);
  }
});

console.log(`\n=== RESUMO ===`);
console.log(`Arquivos processados: ${filesProcessed}`);
console.log(`Total de substituições: ${totalReplacements}`);
console.log(`✓ Correção concluída!`);
