#!/bin/bash

# Script para hacer push a GitHub
# Uso: bash push.sh

echo "🚀 Clinical Case Generator - GitHub Push Script"
echo "================================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estamos en el directorio del proyecto"
    exit 1
fi

# Verificar que git está inicializado
if [ ! -d ".git" ]; then
    echo "❌ Error: Git no está inicializado"
    exit 1
fi

# Mostrar estado actual
echo "📊 Estado actual:"
echo ""
git status
echo ""

# Mostrar remote
echo "🔗 Remote configurado:"
git remote -v
echo ""

# Confirmación
read -p "¿Estás seguro de que quieres hacer push? (s/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Push cancelado"
    exit 1
fi

# Hacer push
echo ""
echo "📤 Haciendo push a GitHub..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Push completado exitosamente!"
    echo ""
    echo "🎉 El proyecto está ahora en GitHub:"
    echo "   https://github.com/medistreamtvlabs/clinical-case-generator"
else
    echo ""
    echo "❌ Error durante el push"
    echo ""
    echo "💡 Posibles soluciones:"
    echo "   1. Verifica tu conexión a internet"
    echo "   2. Usa un Personal Access Token en lugar de contraseña"
    echo "   3. Configura SSH keys en GitHub"
    echo ""
    echo "📖 Lee PUSH_TO_GITHUB.md para más información"
    exit 1
fi
