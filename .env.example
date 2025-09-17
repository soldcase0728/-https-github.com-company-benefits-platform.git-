# Application Environment
NODE_ENV=development
APP_NAME=benefits-platform
APP_VERSION=1.0.0

# Database Configuration
DATABASE_URL=postgresql://benefits:localpassword@localhost:5432/benefits_platform
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://:localredis@localhost:6379
REDIS_TLS=false

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=7d
SESSION_SECRET=your-session-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
HASH_SALT_ROUNDS=10

# OAuth Providers
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.benefits-platform.com

# API Configuration
API_GATEWAY_URL=http://localhost:4000
EMPLOYEE_PORTAL_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3001
API_RATE_LIMIT=100
API_RATE_WINDOW=15m

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=localstack
AWS_SECRET_ACCESS_KEY=localstack
AWS_S3_BUCKET=benefits-documents
AWS_S3_REGION=us-east-1
AWS_KMS_KEY_ID=your-kms-key-id

# Document AI Service
DOCUMENT_AI_ENDPOINT=http://localhost:8080
DOCUMENT_AI_API_KEY=your-document-ai-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Email Service
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@benefits-platform.com
SMTP_SECURE=false

# Message Queue
RABBITMQ_URL=amqp://benefits:localrabbit@localhost:5672
QUEUE_ENROLLMENT_NAME=enrollment-queue
QUEUE_DOCUMENTS_NAME=documents-queue
QUEUE_NOTIFICATIONS_NAME=notifications-queue

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=benefits

# Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Monitoring & Observability
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key
LOG_LEVEL=debug
ENABLE_TRACING=true
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Compliance & Security
HIPAA_COMPLIANCE_MODE=true
ENABLE_AUDIT_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=2555
PII_ENCRYPTION_ENABLED=true
DATA_RETENTION_DAYS=365

# Multi-tenancy
TENANT_ISOLATION_MODE=schema
DEFAULT_TENANT_ID=default
ENABLE_TENANT_CUSTOM_DOMAINS=false

# Feature Flags
FEATURE_AI_ENROLLMENT=true
FEATURE_DOCUMENT_PARSING=true
FEATURE_RULES_ENGINE=true
FEATURE_REAL_TIME_ELIGIBILITY=true
FEATURE_PREDICTIVE_ANALYTICS=false

# Carrier Integration
CARRIER_API_TIMEOUT=30000
CARRIER_RETRY_ATTEMPTS=3
CARRIER_CACHE_TTL=3600

# Performance
CACHE_TTL=3600
ENABLE_QUERY_OPTIMIZATION=true
MAX_UPLOAD_SIZE=52428800
REQUEST_TIMEOUT=30000

# Development Tools
ENABLE_SWAGGER=true
ENABLE_GRAPHQL_PLAYGROUND=true
ENABLE_DEBUG_TOOLBAR=true