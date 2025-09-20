#!/bin/bash

# Enhanced environment checker that includes version checks plus more

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Benefits Platform - Environment Validator v2.0     ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check command existence and version
check_tool() {
    local tool=$1
    local min_version=$2
    local version_cmd=$3
    
    if ! command -v $tool &> /dev/null; then
        echo -e "${RED}✗ $tool: Not installed${NC}"
        ((ERRORS++))
        return 1
    fi
    
    local version=$(eval $version_cmd)
    echo -e "${GREEN}✓ $tool: $version${NC}"
    return 0
}

# 1. Core Dependencies
echo -e "${YELLOW}📦 Core Dependencies${NC}"
echo "─────────────────────────"
check_tool "git" "2.39" "git --version | awk '{print \$3}'"
check_tool "node" "18.0" "node -v"
check_tool "pnpm" "8.0" "pnpm -v 2>/dev/null || echo 'Not installed'"
check_tool "docker" "24.0" "docker --version | cut -d' ' -f3 | cut -d',' -f1"
check_tool "docker-compose" "2.0" "docker compose version --short 2>/dev/null || docker-compose --version | cut -d' ' -f3 | cut -d',' -f1"
echo ""

# 2. Cloud Tools
echo -e "${YELLOW}☁️  Cloud & Infrastructure Tools${NC}"
echo "─────────────────────────────────"
check_tool "terraform" "1.5" "terraform version -json 2>/dev/null | jq -r '.terraform_version' || echo '0'"
check_tool "kubectl" "1.28" "kubectl version --client --output=json 2>/dev/null | jq -r '.clientVersion.gitVersion' || echo '0'"
check_tool "aws" "2.0" "aws --version 2>&1 | cut -d' ' -f1 | cut -d'/' -f2"
check_tool "helm" "3.13" "helm version --short 2>/dev/null | cut -d':' -f2 | sed 's/[^0-9.]//g'"
echo ""

# 3. Check Docker Services
echo -e "${YELLOW}🐳 Docker Services${NC}"
echo "─────────────────────"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
    
    # Check for required images
    REQUIRED_IMAGES=(
        "postgres:16"
        "redis:7"
        "elasticsearch:8.10.2"
        "minio/minio"
    )
    
    for image in "${REQUIRED_IMAGES[@]}"; do
        if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "$image"; then
            echo -e "${GREEN}  ✓ Image: $image${NC}"
        else
            echo -e "${YELLOW}  ⚠ Image not pulled: $image${NC}"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    ((ERRORS++))
fi
echo ""

# 4. Check Ports
echo -e "${YELLOW}🔌 Port Availability${NC}"
echo "─────────────────────"
PORTS=(3000 3001 4000 5432 6379 9000 9200)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}  ⚠ Port $port is in use${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}  ✓ Port $port is available${NC}"
    fi
done
echo ""

# 5. Check Environment Files
echo -e "${YELLOW}📄 Configuration Files${NC}"
echo "──────────────────────"
FILES=(
    ".env"
    "turbo.json"
    "docker-compose.yml"
    "package.json"
    "pnpm-workspace.yaml"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file exists${NC}"
    else
        echo -e "${YELLOW}  ⚠ $file missing${NC}"
        ((WARNINGS++))
    fi
done
echo ""

# 6. Check Environment Variables
echo -e "${YELLOW}🔐 Environment Variables${NC}"
echo "────────────────────────"
if [ -f .env ]; then
    REQUIRED_VARS=(
        "NODE_ENV"
        "DATABASE_URL"
        "REDIS_URL"
        "AUTH0_DOMAIN"
        "AUTH0_CLIENT_ID"
        "AWS_REGION"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            echo -e "${GREEN}  ✓ $var is set${NC}"
        else
            echo -e "${YELLOW}  ⚠ $var not set in .env${NC}"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${RED}✗ .env file not found${NC}"
    ((ERRORS++))
fi
echo ""

# 7. Check Node Modules
echo -e "${YELLOW}📚 Node Dependencies${NC}"
echo "───────────────────"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
    
    # Check for key packages
    PACKAGES=("@prisma/client" "next" "typescript" "turbo")
    for pkg in "${PACKAGES[@]}"; do
        if [ -d "node_modules/$pkg" ]; then
            echo -e "${GREEN}  ✓ $pkg installed${NC}"
        else
            echo -e "${YELLOW}  ⚠ $pkg not found${NC}"
            ((WARNINGS++))
        fi
    done
else
    echo -e "${YELLOW}⚠ node_modules not found - run 'pnpm install'${NC}"
    ((WARNINGS++))
fi
echo ""

# 8. Database Connectivity
echo -e "${YELLOW}🗄️  Database Connectivity${NC}"
echo "────────────────────────"
if command -v psql &> /dev/null; then
    if PGPASSWORD=localpassword psql -h localhost -U benefits -d benefits_platform -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot connect to PostgreSQL${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ psql client not installed${NC}"
fi

if command -v redis-cli &> /dev/null; then
    if redis-cli -h localhost -a localredis ping 2>/dev/null | grep -q PONG; then
        echo -e "${GREEN}✓ Redis connection successful${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot connect to Redis${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ redis-cli not installed${NC}"
fi
echo ""

# 9. Disk Space
echo -e "${YELLOW}💾 Disk Space${NC}"
echo "────────────"
AVAILABLE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✓ Available space: $AVAILABLE${NC}"
echo ""

# 10. Network Connectivity
echo -e "${YELLOW}🌐 Network Connectivity${NC}"
echo "──────────────────────"
ENDPOINTS=(
    "github.com:443"
    "registry.npmjs.org:443"
    "hub.docker.com:443"
)

for endpoint in "${ENDPOINTS[@]}"; do
    if timeout 2 bash -c "cat < /dev/null > /dev/tcp/${endpoint%:*}/${endpoint#*:}" 2>/dev/null; then
        echo -e "${GREEN}  ✓ $endpoint reachable${NC}"
    else
        echo -e "${RED}  ✗ $endpoint unreachable${NC}"
        ((ERRORS++))
    fi
done
echo ""

# Summary
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                        SUMMARY                         ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Environment is fully configured and ready!${NC}"
    echo -e "${GREEN}   Run 'make dev-up' to start the platform${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Environment has $WARNINGS warnings${NC}"
    echo -e "${YELLOW}   The platform should work but review warnings above${NC}"
    exit 0
else
    echo -e "${RED}❌ Environment has $ERRORS errors and $WARNINGS warnings${NC}"
    echo -e "${RED}   Please fix errors before proceeding${NC}"
    exit 1
fi
