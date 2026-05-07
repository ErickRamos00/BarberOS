#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys

files = [
    'app.js',
    'public/app.js', 
    'public/booking-functions.js'
]

replacements = {
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
}

print("Iniciando correção de encoding UTF-8...\n")

total_replacements = 0
files_processed = 0

for file in files:
    file_path = os.path.join(os.getcwd(), file)
    
    if os.path.exists(file_path):
        print(f"Processando: {file}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_replacements = 0
        
        for old, new in replacements.items():
            count = content.count(old)
            if count > 0:
                print(f"  {old} → {new}: {count} ocorrência(s)")
                content = content.replace(old, new)
                file_replacements += count
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ {file}: {file_replacements} substituições realizadas\n")
        
        files_processed += 1
        total_replacements += file_replacements
    else:
        print(f"✗ Arquivo não encontrado: {file}\n")

print(f"\n=== RESUMO ===")
print(f"Arquivos processados: {files_processed}")
print(f"Total de substituições: {total_replacements}")
print(f"✓ Correção concluída!")
