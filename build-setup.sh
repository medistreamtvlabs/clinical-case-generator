#!/bin/bash
# Build setup script for Render.com deployment
# This script ensures all dependencies are properly installed

echo "🔧 Starting build setup..."

# Update npm to latest version
echo "📦 Updating npm..."
npm install -g npm@latest

# Install dependencies with retry logic
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps --prefer-offline --no-audit || {
  echo "⚠️ First install attempt failed, trying with --force..."
  npm install --legacy-peer-deps --force || {
    echo "❌ Dependencies installation failed"
    exit 1
  }
}

echo "✅ Build setup complete!"
