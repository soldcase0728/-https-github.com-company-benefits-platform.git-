#!/bin/bash

echo "🔍 Validating Benefits Platform Setup..."

# Check for conflicts
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
    echo "❌ Found conflicting lock files! Remove package-lock.json or yarn.lock"
    exit 1
fi

# Check pnpm-workspace.yaml
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Missing pnpm-workspace.yaml"
    exit 1
fi

# Check node_modules/.ignored
if [ -d "node_modules/.ignored" ]; then
    echo "⚠️ Found ignored modules from other package managers"
    echo "   Run: rm -rf node_modules && pnpm install"
fi

# Check Prisma
if command -v prisma &> /dev/null; then
    echo "✅ Prisma CLI available"
    pnpm prisma generate
else
    echo "❌ Prisma CLI not found"
fi

echo "✅ Validation complete!"
