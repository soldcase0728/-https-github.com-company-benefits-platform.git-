#!/bin/bash

echo "🚀 Setting up pnpm workspace for Benefits Platform"

# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
EOF

echo "✅ Created pnpm-workspace.yaml"

# Create directory structure
echo "📁 Creating workspace directories..."
mkdir -p apps packages services

# Create root package.json if it doesn't exist
if [ ! -f "package.json" ]; then
  cat > package.json << 'EOF'
{
  "name": "benefits-platform",
  "version": "1.0.0",
  "private": true,
  "description": "Benefits Platform Monorepo",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "type-check": "turbo run type-check",
    "preinstall": "npx only-allow pnpm",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.31",
    "@types/react-dom": "^18.2.14",
    "turbo": "^1.10.16",
    "typescript": "^5.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.10.0"
}
EOF
  echo "✅ Created root package.json"
fi

# Create .npmrc for workspace settings
cat > .npmrc << 'EOF'
# pnpm settings
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
enable-pre-post-scripts=true
shared-workspace-lockfile=true

# Registry
registry=https://registry.npmjs.org/

# Workspace settings
link-workspace-packages=deep
prefer-workspace-packages=true

# Performance
node-linker=hoisted
EOF

echo "✅ Created .npmrc with workspace settings"

# Create turbo.json if it doesn't exist
if [ ! -f "turbo.json" ]; then
  cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", ".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
  echo "✅ Created turbo.json"
fi

echo ""
echo "📦 Installing workspace dependencies..."
pnpm install

echo ""
echo "✅ Workspace setup complete!"
echo ""
echo "Next steps:"
echo "1. Install shared dependencies: pnpm add -w -D @types/react @types/node"
echo "2. Install package-specific deps: cd apps/web-employee && pnpm add next react"
echo "3. Run development: pnpm dev"
