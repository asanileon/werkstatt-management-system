#!/bin/bash

echo "🚀 Werkstatt Management System - Starter Script"
echo "=============================================="
echo ""

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    echo "Bitte installiere Node.js 20+ von: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js Version: $(node --version)"
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local nicht gefunden - erstelle Datei..."
    cat > .env.local << 'EOF'
MONGODB_URI=mongodb://localhost:27017/werkstatt
JWT_SECRET=mein-super-geheimer-schluessel-xyz123
EOF
    echo "✅ .env.local erstellt"
fi

# Prüfe ob node_modules existiert
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
    echo "✅ Dependencies installiert"
fi

echo ""
echo "🚀 Starte Development Server..."
echo ""
echo "➡️  Öffne Browser: http://localhost:3000"
echo "➡️  Zum Stoppen: Ctrl+C"
echo ""

npm run dev
