#!/bin/bash

# Script para encontrar modelos no usados

echo "🔍 BUSCANDO MODELOS NO USADOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Lista de modelos
models=(
  "Achievement"
  "Category"
  "Event"
  "GameSetting"
  "LevelHistory"
  "LevelRequirement"
  "Offer"
  "PlayerStat"
  "Purchase"
  "Ranking"
  "TelegramLinkToken"
  "Transaction"
)

for model in "${models[@]}"; do
  # Buscar imports del modelo (excluyendo el archivo del modelo mismo)
  count=$(grep -r "from.*models\/$model" src/ --include="*.ts" | grep -v "src/models/$model.ts" | wc -l)
  
  if [ "$count" -eq 0 ]; then
    echo "❌ $model.ts - NO USADO (0 imports)"
  else
    echo "✅ $model.ts - USADO ($count imports)"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
