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
  'ðŸ"…': '📋',
  'ðŸŽ¯': '🎯',
};

console.log('🔧 Iniciando correção de encoding UTF-8...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} - Não encontrado`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let count = 0;
    
    Object.entries(replacements).forEach(([old, newText]) => {
      const matches = (content.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (matches > 0) {
        content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
        count += matches;
      }
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - ${count} substituição(ões) realizada(s)`);
  } catch (err) {
    console.log(`❌ ${file} - Erro: ${err.message}`);
  }
});

console.log('\n✅ Correção concluída!');
