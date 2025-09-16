#!/bin/bash

# Get the actual directory name
ROOT_DIR=$(pwd)

echo "🏥 Benefits Platform Health Check"
echo "================================="
echo "📁 Project Root: $ROOT_DIR"
echo ""

# Check Node
echo -n "✓ Node.js: "
node --version || echo "❌ Not found"

# Check npm
echo -n "✓ NPM: "
npm --version || echo "❌ Not found"

# Check Docker
echo -n "✓ Docker: "
docker --version 2>/dev/null || echo "❌ Not found (OK for Codespaces)"

# Check .env files
echo ""
echo "Environment Files:"
if [ -f ".env.example" ]; then
  echo "  ✅ .env.example exists"
else
  echo "  ❌ .env.example missing"
fi

if [ -f ".env" ]; then
  echo "  ✅ .env file exists"
  
  # Check for encryption keys
  if grep -q "ENCRYPTION_KEY" .env; then
    echo "  ✅ ENCRYPTION_KEY configured"
  else
    echo "  ❌ ENCRYPTION_KEY missing"
  fi
  
  if grep -q "ENCRYPTION_SALT" .env; then
    echo "  ✅ ENCRYPTION_SALT configured"
  else
    echo "  ❌ ENCRYPTION_SALT missing"
  fi
else
  echo "  ❌ .env file missing"
fi

# Check directory structure
echo ""
echo "Project Structure:"
[ -d "packages" ] && echo "  ✅ packages/" || echo "  ❌ packages/ missing"
[ -d "packages/database" ] && echo "    ✅ database/" || echo "    ⚠️  database/ missing"
[ -d "services" ] && echo "  ✅ services/" || echo "  ❌ services/ missing"
[ -d "apps" ] && echo "  ✅ apps/" || echo "  ❌ apps/ missing"
[ -d "deploy" ] && echo "  ✅ deploy/" || echo "  ⚠️  deploy/ missing"
[ -d "ai" ] && echo "  ✅ ai/" || echo "  ⚠️  ai/ missing"

# Check if database package is set up
echo ""
echo "Database Package:"
if [ -f "packages/database/package.json" ]; then
  echo "  ✅ package.json exists"
  
  if [ -d "packages/database/node_modules" ]; then
    echo "  ✅ Dependencies installed"
  else
    echo "  ⚠️  Dependencies not installed - run: cd packages/database && npm install"
  fi
  
  if [ -f "packages/database/src/encryption/field-encryption.js" ] || [ -f "packages/database/src/encryption/field-encryption.ts" ]; then
    echo "  ✅ Encryption module exists"
  else
    echo "  ❌ Encryption module missing"
  fi
else
  echo "  ❌ package.json missing - run: cd packages/database && npm init -y"
fi

# Check if encryption test exists
if [ -f "packages/database/test-encryption-complete.js" ]; then
  echo "  ✅ Encryption test script exists"
else
  echo "  ⚠️  Encryption test script missing"
fi

echo ""
echo "================================="
echo "✅ Health Check Complete!"
echo ""

# Show next actionable steps based on what's missing
echo "📋 Next Steps:"
NEXT_STEP=1

if [ ! -f "packages/database/src/encryption/field-encryption.js" ] && [ ! -f "packages/database/src/encryption/field-encryption.ts" ]; then
  echo "$NEXT_STEP. Create encryption module in packages/database/src/encryption/"
  NEXT_STEP=$((NEXT_STEP + 1))
fi

if [ -f "packages/database/test-encryption-complete.js" ]; then
  echo "$NEXT_STEP. Run encryption test: cd packages/database && node test-encryption-complete.js"
  NEXT_STEP=$((NEXT_STEP + 1))
fi

echo "$NEXT_STEP. Set up Prisma schema with compliance fields"
NEXT_STEP=$((NEXT_STEP + 1))

echo "$NEXT_STEP. Add audit logging"
echo ""
echo "🚀 Ready to test? Run: cd packages/database && node test-encryption-complete.js"