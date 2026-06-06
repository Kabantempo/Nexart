#!/bin/bash

# Nexart Mobile — Expo Web Launcher
# Run: chmod +x launch-expo.sh && ./launch-expo.sh

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 Nexart Mobile — Expo Web Launcher                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "✅ Killing any existing Expo processes..."
pkill -f "node.*expo" || true
sleep 2

echo "✅ Starting Expo Web..."
echo ""
echo "🔗 App will be available at: http://localhost:19006"
echo ""
echo "📱 For Mobile Preview in VS Code:"
echo "   - Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)"
echo "   - Search: 'Mobile Preview: Open Preview'"
echo "   - Enter: http://localhost:19006"
echo ""
echo "⏳ Waiting for compilation (this may take 1-2 minutes)..."
echo ""

npm run web
