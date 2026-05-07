#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Lista de substituições: (antigo, novo)
replacements = [
    # Remover emojis e deixar apenas texto
    ('âœ"', ''),  # checkmark vazio
    ('âœ—', ''),  # x vazio
    ('âœŽ', ''),  # lápis vazio
    ('âœ•', ''),  # X vazio
    ('âœ‚', ''),  # scissors vazio
    ('âœ‰', ''),  # envelope vazio
    ('ðŸ"…', ''),  # clipboard vazio
    ('ðŸ'°', ''),  # money vazio
    ('ðŸ"Š', ''),  # chart vazio
    ('ðŸ'¸', ''),  # moeda vazio
    ('ðŸŽ¯', ''),  # target vazio
    ('â†'', '+'),  # seta up → +
    # Corrigir encoding português
    ('Ã©', 'e'),
    ('Ã§', 'c'),
    ('Ã³', 'o'),
    ('Ã£', 'a'),
    ('Ã¡', 'a'),
    ('Ã­', 'i'),
    ('Ã µ', 'o'),
    ('Ãº', 'u'),
    ('Â·', '-'),  # bullet → dash
]

print("Iniciando limpeza do arquivo...")
for old, new in replacements:
    if old in content:
        count = content.count(old)
        content = content.replace(old, new)
        print(f"  {repr(old)} → {repr(new)}: {count} vezes")

# Salvar
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Arquivo limpo e salvo!")
