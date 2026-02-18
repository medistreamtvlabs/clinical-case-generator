#!/bin/bash

# Script rápido para hacer push a GitHub
# Uso: GITHUB_TOKEN="tu_token" bash FAST_PUSH.sh

echo "🚀 Clinical Case Generator - Fast Push"
echo "======================================"
echo ""

# Verificar token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN no está configurado"
    echo ""
    echo "Instrucciones:"
    echo "1. Ve a: https://github.com/settings/tokens/new"
    echo "2. Crea un Personal Access Token con scope 'repo'"
    echo "3. Ejecuta:"
    echo ""
    echo "   GITHUB_TOKEN='tu_token_aqui' bash FAST_PUSH.sh"
    echo ""
    exit 1
fi

# Configurar git
export GIT_AUTHOR_NAME="Clinical Case Generator"
export GIT_AUTHOR_EMAIL="dev@casosclinicos.app"
export GIT_COMMITTER_NAME="Clinical Case Generator"
export GIT_COMMITTER_EMAIL="dev@casosclinicos.app"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estamos en el directorio del proyecto"
    exit 1
fi

echo "📊 Estado:"
git status --short
echo ""

# Hacer push con token
echo "📤 Haciendo push..."
git push https://${GITHUB_TOKEN}@github.com/medistreamtvlabs/clinical-case-generator.git main:main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Push completado!"
    echo ""
    echo "🎉 Verifica en:"
    echo "   https://github.com/medistreamtvlabs/clinical-case-generator"
else
    echo ""
    echo "❌ Error en el push"
    exit 1
fi
