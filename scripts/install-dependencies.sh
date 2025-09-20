#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Versions (update as needed)
TERRAFORM_VERSION="1.5.7"
KUBECTL_VERSION="1.28.3"
AWS_CLI_VERSION="2.13.25"
HELM_VERSION="3.13.1"
NODE_VERSION="18"
PNPM_VERSION="8.10.0"

# OS Detection
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        elif [ -f /etc/arch-release ]; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unsupported"
    fi
}

OS=$(detect_os)

echo -e "${GREEN}🚀 Benefits Platform - Dependency Installer${NC}"
echo -e "${YELLOW}Detected OS: $OS${NC}"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Install Git
install_git() {
    echo -e "${YELLOW}📦 Installing Git...${NC}"
    if command_exists git; then
        echo -e "${GREEN}✓ Git already installed: $(git --version)${NC}"
    else
        case $OS in
            debian)
                sudo apt-get update && sudo apt-get install -y git
                ;;
            redhat)
                sudo yum install -y git
                ;;
            arch)
                sudo pacman -S --noconfirm git
                ;;
            macos)
                brew install git
                ;;
        esac
    fi
}

# Install Docker
install_docker() {
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    if command_exists docker; then
        echo -e "${GREEN}✓ Docker already installed: $(docker --version)${NC}"
    else
        case $OS in
            debian|ubuntu)
                curl -fsSL https://get.docker.com | sudo bash
                sudo usermod -aG docker $USER
                echo -e "${YELLOW}⚠️  Please log out and back in for docker group changes${NC}"
                ;;
            redhat)
                sudo yum install -y docker
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                ;;
            arch)
                sudo pacman -S --noconfirm docker docker-compose
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                ;;
            macos)
                echo -e "${YELLOW}Please install Docker Desktop from: https://www.docker.com/products/docker-desktop${NC}"
                ;;
        esac
    fi
}

# Install Node.js
install_nodejs() {
    echo -e "${YELLOW}📦 Installing Node.js v${NODE_VERSION}...${NC}"
    if command_exists node; then
        CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_NODE" -ge "$NODE_VERSION" ]; then
            echo -e "${GREEN}✓ Node.js already installed: $(node -v)${NC}"
            return
        fi
    fi
    
    case $OS in
        debian)
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        redhat)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        arch)
            sudo pacman -S --noconfirm nodejs npm
            ;;
        macos)
            brew install node@${NODE_VERSION}
            ;;
    esac
}

# Install pnpm
install_pnpm() {
    echo -e "${YELLOW}📦 Installing pnpm v${PNPM_VERSION}...${NC}"
    if command_exists pnpm; then
        echo -e "${GREEN}✓ pnpm already installed: $(pnpm --version)${NC}"
    else
        npm install -g pnpm@${PNPM_VERSION}
    fi
}

# Install Terraform (Official Method)
install_terraform() {
    echo -e "${YELLOW}📦 Installing Terraform v${TERRAFORM_VERSION}...${NC}"
    
    if command_exists terraform; then
        CURRENT_VERSION=$(terraform version -json 2>/dev/null | jq -r '.terraform_version' 2>/dev/null || echo "0")
        if [[ "$CURRENT_VERSION" == "$TERRAFORM_VERSION" ]]; then
            echo -e "${GREEN}✓ Terraform already installed: v${CURRENT_VERSION}${NC}"
            return
        fi
    fi
    
    case $OS in
        debian)
            # HashiCorp Official APT repository
            wget -O- https://apt.releases.hashicorp.com/gpg | \
                gpg --dearmor | \
                sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg >/dev/null
            echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
                https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
                sudo tee /etc/apt/sources.list.d/hashicorp.list
            sudo apt update && sudo apt install -y terraform=${TERRAFORM_VERSION}-1
            ;;
        redhat)
            # HashiCorp Official YUM repository
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
            sudo yum install -y terraform-${TERRAFORM_VERSION}
            ;;
        arch)
            # Direct binary download for Arch
            wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            sudo mv terraform /usr/local/bin/
            rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            ;;
        macos)
            brew tap hashicorp/tap
            brew install hashicorp/tap/terraform
            ;;
        *)
            # Generic Linux - direct download
            wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            sudo mv terraform /usr/local/bin/
            rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip
            ;;
    esac
}

# Install kubectl (Official Method)
install_kubectl() {
    echo -e "${YELLOW}📦 Installing kubectl v${KUBECTL_VERSION}...${NC}"
    
    if command_exists kubectl; then
        CURRENT_VERSION=$(kubectl version --client --output=json 2>/dev/null | jq -r '.clientVersion.gitVersion' | cut -d'v' -f2 || echo "0")
        if [[ "$CURRENT_VERSION" == "$KUBECTL_VERSION" ]]; then
            echo -e "${GREEN}✓ kubectl already installed: v${CURRENT_VERSION}${NC}"
            return
        fi
    fi
    
    case $OS in
        debian)
            # Kubernetes Official APT repository
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl
            curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
            echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
            sudo apt-get update
            sudo apt-get install -y kubectl=${KUBECTL_VERSION}-1.1
            ;;
        redhat)
            # Kubernetes Official YUM repository
            cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/repodata/repomd.xml.key
EOF
            sudo yum install -y kubectl-${KUBECTL_VERSION}
            ;;
        arch)
            # Direct binary download for Arch
            curl -LO "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
            sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
            rm kubectl
            ;;
        macos)
            brew install kubectl
            ;;
        *)
            # Generic Linux - direct download
            curl -LO "https://dl.k8s.io/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
            sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
            rm kubectl
            ;;
    esac
}

# Install AWS CLI v2 (Official Method)
install_awscli() {
    echo -e "${YELLOW}📦 Installing AWS CLI v2...${NC}"
    
    if command_exists aws; then
        CURRENT_VERSION=$(aws --version 2>&1 | cut -d' ' -f1 | cut -d'/' -f2)
        echo -e "${GREEN}✓ AWS CLI already installed: v${CURRENT_VERSION}${NC}"
        return
    fi
    
    case $OS in
        debian|redhat|arch)
            # Universal Linux install for AWS CLI v2
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip -q awscliv2.zip
            sudo ./aws/install
            rm -rf awscliv2.zip aws/
            ;;
        macos)
            if [[ $(uname -m) == 'arm64' ]]; then
                # Apple Silicon
                curl "https://awscli.amazonaws.com/AWSCLIV2-arm64.pkg" -o "AWSCLIV2.pkg"
            else
                # Intel
                curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
            fi
            sudo installer -pkg AWSCLIV2.pkg -target /
            rm AWSCLIV2.pkg
            ;;
    esac
}

# Install Helm (Official Method)
install_helm() {
    echo -e "${YELLOW}📦 Installing Helm v${HELM_VERSION}...${NC}"
    
    if command_exists helm; then
        CURRENT_VERSION=$(helm version --template='{{.Version}}' 2>/dev/null | cut -d'v' -f2)
        if [[ "$CURRENT_VERSION" == "$HELM_VERSION" ]]; then
            echo -e "${GREEN}✓ Helm already installed: v${CURRENT_VERSION}${NC}"
            return
        fi
    fi
    
    # Official Helm install script
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    chmod 700 get_helm.sh
    ./get_helm.sh --version v${HELM_VERSION}
    rm get_helm.sh
}

# Install additional tools
install_additional_tools() {
    echo -e "${YELLOW}📦 Installing additional tools...${NC}"
    
    case $OS in
        debian)
            sudo apt-get install -y \
                jq \
                make \
                gcc \
                g++ \
                python3 \
                python3-pip \
                postgresql-client \
                redis-tools
            ;;
        redhat)
            sudo yum install -y \
                jq \
                make \
                gcc \
                gcc-c++ \
                python3 \
                python3-pip \
                postgresql \
                redis
            ;;
        arch)
            sudo pacman -S --noconfirm \
                jq \
                make \
                gcc \
                python \
                python-pip \
                postgresql-libs \
                redis
            ;;
        macos)
            brew install \
                jq \
                make \
                postgresql \
                redis
            ;;
    esac
}

# Main installation flow
main() {
    echo -e "${GREEN}Starting installation...${NC}"
    
    # Check for sudo/admin access
    if [[ $OS != "macos" ]]; then
        if ! sudo -n true 2>/dev/null; then
            echo -e "${YELLOW}This script requires sudo access. Please enter your password:${NC}"
            sudo true
        fi
    fi
    
    # Install tools
    install_git
    install_docker
    install_nodejs
    install_pnpm
    install_terraform
    install_kubectl
    install_awscli
    install_helm
    install_additional_tools
    
    echo ""
    echo -e "${GREEN}✅ Installation complete!${NC}"
    echo ""
    echo "Installed versions:"
    command_exists git && echo "  - Git: $(git --version)"
    command_exists docker && echo "  - Docker: $(docker --version)"
    command_exists node && echo "  - Node.js: $(node --version)"
    command_exists pnpm && echo "  - pnpm: $(pnpm --version)"
    command_exists terraform && echo "  - Terraform: $(terraform version -json | jq -r '.terraform_version')"
    command_exists kubectl && echo "  - kubectl: $(kubectl version --client --output=json | jq -r '.clientVersion.gitVersion')"
    command_exists aws && echo "  - AWS CLI: $(aws --version)"
    command_exists helm && echo "  - Helm: $(helm version --template='{{.Version}}')"
    
    echo ""
    echo -e "${YELLOW}⚠️  Notes:${NC}"
    echo "  1. If you installed Docker, please log out and back in for group changes"
    echo "  2. Configure AWS CLI: aws configure"
    echo "  3. Some tools may require opening a new terminal session"
}

# Run main function
main
