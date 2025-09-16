# Copilot Instructions for Benefits Platform

## Big Picture Architecture
- **Monorepo**: Uses Yarn/NPM workspaces. Apps in `apps/`, shared code in `packages/`.
- **Core Services**:
  - `api-gateway`: Express-based, proxies to microservices, handles OIDC auth, multi-tenancy, audit, metrics.
  - `employee-portal`, `admin-dashboard`: Next.js frontends.
  - `benefits-svc`, `enrollment-svc`, etc.: Microservices (see `api_gateway_app.ts` for proxy config).
- **Database**: PostgreSQL (Prisma ORM, multi-schema for tenants). Schema in `packages/database/prisma/schema.prisma`.
- **Infra**: Docker Compose for local, Terraform for AWS (see `infrastructure/`).

## Enrollment MVP Flow (Priority)
- **MVPEnrollment** interface:
  - `employee`: `{ id, dependents }`
  - `plan`: `{ id, type, tier }`
  - `elections`: `Map<PlanId, Coverage>`
  - `submission`: `{ status, confirmationNumber }`
- **End-to-End Steps**:
  1. **Employee Auth**: OIDC (Auth0, see `.env.example` for config)
  2. **Plan Display**: Read-only, 3 test plans (seed via `db:seed`)
  3. **Enrollment**: Submit elections, persist to DB
  4. **Confirmation**: Email + PDF (see notification/document services)

## Developer Workflows

- **Start All Services**: `make dev-up` (builds and starts all Docker containers)
- **Database Migrate**: `make db-migrate` (applies database schemas)
- **Seed Test Data**: `chmod +x ./scripts/seed.sh && ./scripts/seed.sh` (demo users, plans, carriers)
- **Test EDI Integration**: `chmod +x ./scripts/edi_demo.sh && ./scripts/edi_demo.sh` (carrier EDI demo)
- **Access Apps**: Use Codespaces "Ports" tab for URLs:
  - Employee Portal: port 3000
  - Admin Dashboard: port 3001
  - API Gateway: port 8000
- **Check Logs**: `make logs` (verify all services are healthy)
- **Test Logins** (seeded):
  - Employee: `alex.employee@example.com` / `Changeme123!`
  - Admin: `broker.admin@example.com` / `Changeme123!`
- **General**:
  - `npm run start:local` (legacy local dev)
  - `npm run build`, `npm run test`, `npm run lint`, `npm run type-check`
  - `npm run db:migrate`, `npm run db:seed`
  - `./scripts/pre-push-safety-check.sh` before pushing
  - Copy `.env.example` to `.env` and fill secrets

## Project Conventions
- **TypeScript strict mode** everywhere
- **No .env files committed** (enforced by pre-commit and CI)
- **Security**: All endpoints require OIDC/JWT, RBAC enforced, audit logging on sensitive actions
- **Multi-tenancy**: Tenant context via middleware, tenantId in headers
- **API Gateway**: All service calls proxied via `/api/*` endpoints
- **Prisma**: Use `@schema("public")` or `@schema("tenant")` for models

## Integration Points
- **OIDC**: Auth0 (see `.env.example`)
- **Email/PDF**: Notification and document services (proxied via API Gateway)
- **Carrier/AI/Rules**: Dedicated microservices, see proxy config in `api_gateway_app.ts`
- **Observability**: Sentry, Datadog, Jaeger (see `.env.example`)

## Examples
- **Proxy pattern**: See `api_gateway_app.ts` for how requests are routed and context is forwarded
- **Enrollment data model**: See `packages/database/prisma/schema.prisma` (Enrollment, Plan, Employee)
- **Frontend usage**: See `apps/employee-portal/src/app/page.tsx` for dashboard/enrollment UI

---

## Copilot Usage Tips in Codespaces

- **File Generation**: Type comments like `// Create enrollment service with 834 EDI support` and Copilot will suggest implementation
- **Test Generation**: Start with `describe('Enrollment API', () => {` and Copilot will suggest test cases
- **Schema Creation**: Begin typing `interface EnrollmentData {` and Copilot will suggest fields
- **Docker Config**: In Dockerfiles, comment `# Node.js API with health checks` for suggestions

## Quick Codespaces Commands

- **View Ports**: Click "Ports" tab in bottom panel to see all forwarded URLs
- **Terminal**: Use integrated terminal (you're already there!)
- **File Explorer**: Left sidebar for navigation
- **Command Palette**: Cmd/Ctrl + Shift + P for all VS Code commands

## Important for Codespaces

- All ports are automatically forwarded with HTTPS URLs
- Persistent storage between sessions
- 4-core, 8GB RAM default (upgrade if needed in settings)
- Copilot works seamlessly in the editor

For questions, see `SECURITY.md` and `security_policy.md` for compliance/security, or ask @platform-team-leads.
