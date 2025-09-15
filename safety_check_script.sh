#!/bin/bash

# Pre-Push Safety Check Script
# Run this before pushing to GitHub to ensure no secrets are exposed
# Usage: ./scripts/pre-push-safety-check.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Starting Pre-Push Safety Check..."
echo "====================================="

ERRORS=0
WARNINGS=0

# Function to check for patterns
check_pattern() {
    local pattern=$1
    local description=$2
    local exclude_dirs="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build"
    
    if grep -r "$pattern" . $exclude_dirs --exclude="*.md" --exclude="pre-push-safety-check.sh" 2>/dev/null | grep -v "example" | grep -v "template"; then
        echo -e "${RED}❌ ERROR: Found $description${NC}"
        ((ERRORS++))
        return 1
    fi
    return 0
}

# 1. Check for .env files
echo "Checking for .env files..."
if find . -name ".env*" -not -name "*.example" -not -path "*/node_modules/*" | grep -q .; then
    echo -e "${RED}❌ ERROR: Found .env files that should not be committed:${NC}"
    find . -name ".env*" -not -name "*.example" -not -path "*/node_modules/*"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ No .env files found${NC}"
fi

# 2. Check for common secret patterns
echo ""
echo "Checking for hardcoded secrets..."

# API Keys
check_pattern "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}['\"]" "potential API keys"

# AWS Keys
check_pattern "AKIA[0-9A-Z]{16}" "AWS access keys"
check_pattern "aws[_-]?secret.*=.*['\"][a-zA-Z0-9/+=]{40}['\"]" "AWS secret keys"

# Private Keys
if grep -r "BEGIN.*PRIVATE KEY" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
    echo -e "${RED}❌ ERROR: Found private keys${NC}"
    ((ERRORS++))
fi

# Passwords
check_pattern "password.*=.*['\"][^'\"]{8,}['\"]" "hardcoded passwords"

# JWT Secrets
check_pattern "jwt[_-]?secret.*=.*['\"][^'\"]{10,}['\"]" "JWT secrets"

# Database URLs with credentials
check_pattern "postgres://[^:]+:[^@]+@" "database URLs with credentials"
check_pattern "mongodb://[^:]+:[^@]+@" "MongoDB URLs with credentials"
check_pattern "redis://:[^@]+@" "Redis URLs with credentials"

# OAuth Secrets
check_pattern "client[_-]?secret.*=.*['\"][a-zA-Z0-9]{20,}['\"]" "OAuth client secrets"

# 3. Check for SSN patterns (PII)
echo ""
echo "Checking for PII (SSN patterns)..."
if grep -r "[0-9]{3}-[0-9]{2}-[0-9]{4}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.prisma" 2>/dev/null | grep -v "example" | grep -v "XXX-XX-XXXX"; then
    echo -e "${YELLOW}⚠️  WARNING: Found SSN patterns${NC}"
    ((WARNINGS++))
fi

# 4. Check for credit card patterns
echo ""
echo "Checking for credit card patterns..."
if grep -r "[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" 2>/dev/null | grep -v "example" | grep -v "XXXX"; then
    echo -e "${YELLOW}⚠️  WARNING: Found credit card patterns${NC}"
    ((WARNINGS++))
fi

# 5. Check file sizes
echo ""
echo "Checking for large files..."
LARGE_FILES=$(find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*" -not -name "*.lock" 2>/dev/null)
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found large files (>1MB):${NC}"
    echo "$LARGE_FILES"
    ((WARNINGS++))
fi

# 6. Check for console.log statements
echo ""
echo "Checking for console.log statements..."
CONSOLE_LOGS=$(grep -r "console\.\(log\|debug\|info\)" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | grep -v "eslint-disable" | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found $CONSOLE_LOGS console.log statements${NC}"
    ((WARNINGS++))
fi

# 7. Check git status
echo ""
echo "Checking git status..."
if ! git diff --cached --quiet; then
    echo -e "${GREEN}✓ Files staged for commit${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: No files staged for commit${NC}"
fi

# 8. Verify critical files exist
echo ""
echo "Verifying critical security files..."
CRITICAL_FILES=(".gitignore" "README.md" ".env.example")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ ERROR: Missing critical file: $file${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ Found $file${NC}"
    fi
done

# 9. Check if .gitignore is working
echo ""
echo "Verifying .gitignore effectiveness..."
SHOULD_BE_IGNORED=$(git status --ignored --porcelain | grep "^!!" | grep -E "\\.env|\\.pem|\\.key" | wc -l)
if [ "$SHOULD_BE_IGNORED" -gt 0 ]; then
    echo -e "${GREEN}✓ Sensitive files are being ignored${NC}"
fi

# 10. Run npm audit
echo ""
echo "Checking for known vulnerabilities..."
if command -v npm &> /dev/null; then
    AUDIT_RESULT=$(npm audit --audit-level=high 2>/dev/null | grep "found" | grep -E "high|critical" || true)
    if [ ! -z "$AUDIT_RESULT" ]; then
        echo -e "${YELLOW}⚠️  WARNING: npm audit found vulnerabilities:${NC}"
        echo "$AUDIT_RESULT"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ No high or critical vulnerabilities found${NC}"
    fi
fi

# Summary
echo ""
echo "====================================="
echo "SAFETY CHECK COMPLETE"
echo "====================================="

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Found $ERRORS critical errors!${NC}"
    echo -e "${RED}DO NOT PUSH TO GITHUB until these are resolved.${NC}"
    echo ""
    echo "To fix:"
    echo "1. Remove or relocate any .env files"
    echo "2. Replace hardcoded secrets with environment variables"
    echo "3. Remove any private keys or certificates"
    echo "4. Use .env.example for configuration templates"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warnings${NC}"
    echo "Review these warnings before pushing."
    echo ""
    echo "Proceed with push? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Push cancelled."
        exit 1
    fi
else
    echo -e "${GREEN}✅ All checks passed! Safe to push.${NC}"
fi

echo ""
echo "Remember to:"
echo "- Review the diff one more time: git diff --cached"
echo "- Ensure branch protections are enabled on GitHub"
echo "- Set up required secrets in GitHub Settings"
echo ""
echo "Ready to push? Run:"
echo "  git push origin main"