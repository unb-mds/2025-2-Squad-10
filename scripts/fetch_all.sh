#!/bin/bash

chmod +x fetch_all.sh

set -e

echo "🚀 Iniciando atualização de dados para Hugo..."

echo "📄 Baixando/atualizando atas..."
python3 fetch_atas.py

echo "🏃 Baixando/atualizando milestones (sprints)..."
python3 fetch_milestones.py

echo "❗ Baixando/atualizando issues..."
python3 fetch_issues.py

echo "✅ Todos os dados atualizados com sucesso!"
