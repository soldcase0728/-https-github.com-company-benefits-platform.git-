## �️ Common Issues

### 🐛 Document Processing Low Confidence
```bash
# Check OCR engine status
curl http://localhost:7103/ocr-quality-test

# Verify AI model endpoints
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
	https://api.openai.com/v1/models

# Check document format/quality
file your-document.pdf
pdfinfo your-document.pdf
```

### 🔌 Carrier Integration Failures
```bash
# Check SFTP connectivity
sftp -v carrier_user@sftp.carrier.com

# Verify EDI format compliance  
./ops/scripts/validate-834.sh sample-834.txt

# Monitor acknowledgment tracking
tail -f logs/carrier-ack.log
```

### 🗄️ Database Connection Issues
```bash
# Test database connectivity
pg_isready -h localhost -p 5432 -U benefits

# Check connection pool status
curl http://localhost:7101/db-stats

# Verify migrations applied
cd services/user-svc && npx prisma migrate status
```
## �🚀 Release Process
```bash
# Automated releases with semantic versioning
1. Merge PR to main branch
2. GitHub Actions runs full test suite  
3. Docker images built and pushed
4. Staging deployment automatically triggered
5. Manual approval required for production
6. Release notes automatically generated
```
## 🤝 Contributing

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test locally
make dev-up
make test
make lint

# 3. Commit with conventional format
git commit -m "feat: add document confidence scoring"

# 4. Push and create PR
git push origin feature/your-feature-name
# Create PR in GitHub
```

### Code Quality Standards

✅ TypeScript: Strict mode enabled, no any types
✅ Linting: ESLint + Prettier for consistent formatting
✅ Testing: 90%+ code coverage requirement
✅ Security: Snyk scanning, dependency updates
✅ Documentation: All public APIs documented
## 📚 Documentation

### API Documentation

- 📖 Interactive Docs: http://localhost:7103/docs (Swagger/OpenAPI)
- 📝 API Reference: docs/api/README.md
- 🎯 Postman Collection: ops/postman/collection.json

### User Guides

- 👤 Admin Guide: docs/user-guides/admin.md
- 🏢 Employer Guide: docs/user-guides/employer.md
- 👥 Employee Guide: docs/user-guides/employee.md
- 🔗 Broker Guide: docs/user-guides/broker.md

### Technical Documentation

- 🏗️ Architecture: docs/architecture.md
- 🚀 Deployment: docs/deployment/README.md
- 🔒 Security: docs/security.md
- 📊 Monitoring: docs/monitoring.md
### Integration Tests
```bash
# Test API endpoints
make test-api

# Test database operations
make test-db

# Test AI model predictions  
make test-ai
```

### End-to-End Tests
```bash
# Full user journey tests
make test-e2e

# Document processing pipeline
make test-document-flow

# Carrier integration tests
make test-carrier-integration
```

### Performance Tests
```bash
# Load testing with k6
k6 run ops/tests/load-test.js

# Document processing benchmarks  
python ops/tests/ocr-benchmark.py

# Database performance tests
make test-db-performance
```
## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all unit tests
make test

# Run with coverage report
make test-coverage

# Test specific service
cd services/docai-svc && python -m pytest
cd services/user-svc && npm test
```
## 📝 Log Aggregation
Centralized logging with structured JSON:
```json
{
	"timestamp": "2024-01-15T10:30:00Z",
	"service": "docai-svc", 
	"level": "INFO",
	"message": "Document processed successfully",
	"metadata": {
		"document_id": "doc_123",
		"confidence_score": 0.94,
		"processing_time_ms": 2350,
		"extracted_fields": 8
	}
}
```
## � Monitoring & Observability

### Health Checks & Monitoring
```bash
# Service health endpoints
curl http://your-domain.com/api/health

# Metrics endpoints (Prometheus format)
curl http://your-domain.com/metrics

# Document processing stats
curl http://your-domain.com/api/docai/stats
```
## �🚀 Deployment Options

### Option 1: Full Cloud (AWS)
Best for: Production workloads, enterprise scale
```bash
# Deploy infrastructure
cd deploy/terraform/environments/prod
terraform apply

# Deploy applications  
./ops/scripts/deploy.sh prod us-east-1

# Access applications
echo "Admin: https://admin.benefits.yourcompany.com"
echo "Employee: https://benefits.yourcompany.com"
```
## � Data Protection
```bash
# Data is encrypted using industry-standard methods:
🔐 Database: PostgreSQL with pgcrypto + KMS keys
🔐 Files: S3 server-side encryption with KMS  
🔐 Cache: Redis TLS encryption
🔐 Messages: Kafka MSK encryption at rest & transit
🔐 Logs: CloudWatch encryption with retention policies
```
## �🛠️ Environment Setup

### Required API Keys

**OpenAI API Key (for document processing AI)**
```bash
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Azure OpenAI (alternative to OpenAI)**
```bash
# Get from Azure Portal → OpenAI Service
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-key
```

### Optional Services

**Auth0 (production authentication)**
```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

**AWS (production deployment)**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com
```

**Monitoring (optional)**
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
DATADOG_API_KEY=your-datadog-api-key
```
## � Docker & Services
```bash
make dev-up          # Start all development services
make dev-down        # Stop and remove all containers
make logs            # View service logs
make db-migrate      # Run database migrations  
make db-reset        # Reset database (⚠️ destructive)
make seed            # Load sample data
```

## 🧹 Code Quality
```bash
make lint            # Lint all projects
make test            # Run all tests
make test-e2e        # Run end-to-end tests
make type-check      # TypeScript type checking
make format          # Format code (Prettier)
```

## 🚀 Building & Deployment
```bash
make build           # Build all applications
make docker-build    # Build Docker images
make deploy-dev      # Deploy to development
make deploy-staging  # Deploy to staging  
make deploy-prod     # Deploy to production (requires approval)
```
## �🚀 Quick Start (5 minutes)

### Prerequisites
- **Docker Desktop** 4.20+
- **Node.js** 18+ LTS
- **Python** 3.11+
- **Git** 2.30+

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/benefits-platform.git
cd benefits-platform
# Copy environment template
cp .env.example .env
# Edit .env with your API keys (see Environment Setup below)
nano .env
pnpm install # or npm install, or yarn install
```


### 2. Start All Services with Docker Compose
```bash
# Start all services
make dev-up
# OR:
docker-compose -f deploy/docker-compose/compose.yml up -d --build
# Wait for services to start (2-3 minutes first time)
make logs  # Check startup progress
```


### 3. Initialize Database & Seed Data
```bash
# Run database migrations
make db-migrate
# Seed with sample data (plans, users, carriers)
make seed
```

### 4. Access Applications
- **Admin Dashboard**: http://localhost:3001
- **Employee Portal**: http://localhost:3000  
- **Document AI Service**: http://localhost:7103
- **API Documentation**: http://localhost:7103/docs


### 5. Test Document Processing
```bash
# Example: Run EDI demo script to test document extraction and carrier integration
chmod +x ./scripts/edi_demo.sh && ./scripts/edi_demo.sh

# Or upload a sample insurance document directly:
curl -X POST -F "file=@ops/samples/sample-spd.pdf" \
	-F "target_fields=plan_name,carrier_name,actuarial_value" \
	http://localhost:7103/extract-precise-data
```

**🎉 You're ready to go!** Login with:
- **Admin**: `admin@example.com` / `Admin123!`
- **Employee**: `employee@example.com` / `Employee123!`

---

## 📦 Project Structure
```
benefits-platform/
├── 🎯 apps/
│   ├── web-admin/              # Admin Dashboard (Next.js)
│   ├── web-employee/           # Employee Portal (Next.js PWA)
│   └── mobile/                 # React Native App (optional)
│
├── 🔧 services/
│   ├── docai-svc/             # Document AI & OCR (FastAPI)
│   ├── user-svc/              # User Management (NestJS)
│   ├── benefits-svc/          # Benefits Engine (NestJS)
│   ├── carrier-svc/           # Carrier Integration (FastAPI)
│   ├── compliance-svc/        # Audit & Compliance (Go)
│   └── files-svc/             # File Storage Proxy (FastAPI)
│
├── 📚 packages/
│   ├── ui/                    # Shared UI Components
│   ├── shared/                # Common Utilities
│   ├── types/                 # TypeScript Definitions
│   └── schemas/               # Data Validation Schemas
│
├── 🚀 deploy/
│   ├── docker-compose/        # Local Development
│   ├── helm/                  # Kubernetes Charts
│   ├── terraform/             # Infrastructure as Code
│   └── k8s/                   # Plain Kubernetes Manifests
│
├── 🤖 ai/
│   ├── prompts/              # AI Prompt Templates
│   ├── policies/             # AI Guardrails & Policies
│   └── models/               # Custom Model Configs
│
├── ⚡ ops/
│   ├── scripts/              # Deployment & Utility Scripts
│   ├── monitoring/           # Grafana Dashboards
│   ├── samples/              # Sample Documents & Data
│   └── runbooks/             # Operational Procedures
│
└── 📋 docs/
		├── api/                  # API Documentation
		├── deployment/           # Deployment Guides
		├── user-guides/          # End User Documentation
		└── compliance/           # HIPAA/SOC2 Documentation
```
# -https-github.com-company-benefits-platform.git-

Benefit Enrollment System

## 🏗️ Architecture Overview

- **Monorepo**: Managed with Yarn/NPM workspaces.  
	- Apps in `apps/` (e.g., `employee-portal`, `web-admin`, `api-gateway`)
	- Shared code in `packages/` (e.g., `@benefits/ui`, `@benefits/shared`, `@benefits/types`)

- **Core Services**:
	- **API Gateway**: Express-based, handles OIDC auth, multi-tenancy, audit, metrics, and proxies to microservices.
	- **Employee Portal**: Next.js, mobile-first, PWA, public landing page in `apps/employee-portal/public`.
	- **Admin Dashboard**: Next.js, React, precision extraction workflow in `apps/web-admin`.
	- **Document AI (docai-svc)**: FastAPI backend for OCR, PDF/Word/Image extraction, ACA field mapping.

- **Database**: PostgreSQL (Prisma ORM, multi-schema for tenants).  
	- Schema in `packages/database/prisma/schema.prisma`.

- **Infra**: Docker Compose for local, Terraform for AWS, Helm for Kubernetes.

- **Integration Points**:
	- **OIDC**: Auth0 for authentication.
	- **Carrier/EDI**: 834/820, REST, SFTP.
	- **Observability**: Sentry, Datadog, Jaeger.

- **Security**:  
	- HIPAA, SOC 2, RBAC, audit logging, multi-tenancy, end-to-end encryption.

- **Developer Workflow**:  
	- `make dev-up`, `make db-migrate`, `npm run build`, `npm run test`, `./scripts/seed.sh`, etc.
