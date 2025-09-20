#!/bin/bash

REQUIRED_VERSIONS=(
    "git:2.39.0"
    "node:18.0.0"
    "docker:24.0.0"
    "terraform:1.5.0"
    "kubectl:1.28.0"
    "aws:2.13.0"
    "helm:3.13.0"
    "pnpm:8.0.0"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Benefits Platform - Version Checker${NC}"
echo "======================================"

check_version() {
    local cmd=$1
    local required=$2
    local current=""
    
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}✗ $cmd: Not installed (required: >=$required)${NC}"
        return 1
    fi
    
    case $cmd in
        git)
            current=$(git --version | cut -d' ' -f3)
            ;;
        node)
            current=$(node -v | cut -d'v' -f2)
            ;;
        docker)
            current=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
            ;;
        terraform)
            current=$(terraform version -json 2>/dev/null | jq -r '.terraform_version' || echo "0")
            ;;
        kubectl)
            current=$(kubectl version --client --output=json 2>/dev/null | jq -r '.clientVersion.gitVersion' | cut -d'v' -f2 || echo "0")
            ;;
        aws)
            current=$(aws --version 2>&1 | cut -d' ' -f1 | cut -d'/' -f2)
            ;;
        helm)
            current=$(helm version --template='{{.Version}}' 2>/dev/null | cut -d'v' -f2)
            ;;
        pnpm)
            current=$(pnpm --version 2>/dev/null || echo "0")
            ;;
    esac
    
    if [[ -z "$current" || "$current" == "0" ]]; then
        echo -e "${RED}✗ $cmd: Unable to determine version${NC}"
        return 1
    fi
    
    # Simple version comparison (major.minor)
    IFS='.' read -ra REQUIRED <<< "$required"
    IFS='.' read -ra CURRENT <<< "$current"
    
    if [[ ${CURRENT[0]} -gt ${REQUIRED[0]} ]] || \
       [[ ${CURRENT[0]} -eq ${REQUIRED[0]} && ${CURRENT[1]} -ge ${REQUIRED[1]} ]]; then
        echo -e "${GREEN}✓ $cmd: $current (required: >=$required)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $cmd: $current (required: >=$required) - Update recommended${NC}"
        return 2
    fi
}

# Check all versions
failed=0
warnings=0

for item in "${REQUIRED_VERSIONS[@]}"; do
    IFS=':' read -ra PAIR <<< "$item"
    check_version "${PAIR[0]}" "${PAIR[1]}"
    result=$?
    if [[ $result -eq 1 ]]; then
        ((failed++))
    elif [[ $result -eq 2 ]]; then
        ((warnings++))
    fi
done

echo ""
echo "======================================"

if [[ $failed -eq 0 && $warnings -eq 0 ]]; then
    echo -e "${GREEN}✅ All dependencies meet requirements!${NC}"
    exit 0
elif [[ $failed -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  All critical dependencies installed, but $warnings need updates${NC}"
    echo -e "${YELLOW}   Run ./scripts/install-dependencies.sh to update${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed critical dependencies missing or outdated${NC}"
    echo -e "${RED}   Run ./scripts/install-dependencies.sh to install${NC}"
    exit 1
fi
