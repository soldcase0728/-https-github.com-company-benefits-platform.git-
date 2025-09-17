# Benefits Platform - Developer Instructions

Benefits Platform is a TypeScript monorepo built with Turbo for multi-tenant benefits enrollment with AI-powered features. The system consists of a Next.js employee portal, Express API gateway, and various supporting packages for database, security, UI components, and multi-tenancy.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup
- Install pnpm globally: `npm install -g pnpm`
- Install dependencies: `pnpm install --no-frozen-lockfile`
- Build all packages: `pnpm run build` -- takes 20 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- Format code: `pnpm run format` -- takes under 1 second.

### Development Commands
- Start employee portal: `cd apps/employee-portal && pnpm run dev` (runs on http://localhost:3000)
- Start API gateway: `cd apps/api-gateway && pnpm run dev` (runs on default Express port)
- Build all: `pnpm run build` -- NEVER CANCEL, takes 20 seconds but may take up to 45 minutes in CI
- Format all files: `pnpm run format`

### Known Working Commands
- ✅ `pnpm install --no-frozen-lockfile` -- installs all dependencies (~35 seconds)
- ✅ `pnpm run build` -- builds all 8 packages successfully (~20 seconds)
- ✅ `pnpm run format` -- formats all code (~1 second)
- ✅ `pnpm run dev` -- starts all development servers
- ❌ `pnpm run test` -- fails due to missing Jest configuration
- ❌ `pnpm run lint` -- fails due to missing ESLint configuration

### Critical Package Manager Notes
- **MUST** use pnpm, not npm - the project uses workspace: protocol
- Remove any package-lock.json files if present
- Ensure pnpm-workspace.yaml exists in root

## Project Structure

### Applications (`apps/`)
- **employee-portal**: Next.js 14 React application for employee benefits enrollment
- **api-gateway**: Express.js TypeScript API gateway for microservice routing

### Packages (`packages/`)
- **database**: Prisma-based database models and utilities
- **shared**: Common utilities and types
- **ui**: Shared React components
- **security**: Authentication and security utilities
- **multi-tenant**: Multi-tenancy support
- **observability**: Monitoring and logging

## Validation

### Manual Testing Requirements
Always manually validate changes by:
1. Building successfully: `pnpm run build`
2. Starting the employee portal: `cd apps/employee-portal && pnpm run dev`
3. Accessing http://localhost:3000 and verifying the page loads with "Benefits Platform - Employee Portal" heading
4. Testing the API gateway: `cd apps/api-gateway && pnpm run dev`
5. Running format before committing: `pnpm run format`

### Pre-commit Validation
- **ALWAYS** run `pnpm run format` before committing
- **ALWAYS** ensure `pnpm run build` succeeds
- Test that applications start successfully after your changes

## Common Issues & Solutions

### Build Issues
- If "multiple package managers detected": Remove package-lock.json
- If "workspace: protocol not supported": Use pnpm instead of npm
- If "cannot find turbo.json": Ensure turbo.json exists in root (copied from turbo_config.json)

### Application Issues
- Employee portal needs proper Next.js layout.tsx and page.tsx files
- API gateway exits cleanly in dev mode due to minimal stub implementation
- Docker services are not available in the current environment

### Environment Setup
- Copy env_example.sh to .env.example for environment variables
- Copy docker_compose.txt to docker-compose.yml for container definitions
- Copy gitignore.txt to .gitignore for proper file exclusions

## Timing Expectations

### Build Times (NEVER CANCEL)
- Fresh install: ~35 seconds
- Full build: ~20 seconds (uncached), ~5 seconds (cached), up to 45 minutes in CI
- Format: <1 second
- Individual package builds: 1-5 seconds each

### Development Server Startup
- Employee portal: ~2 seconds to ready
- API gateway: ~1 second (exits cleanly with stub code)

## Known Limitations

- Tests are not properly configured (missing Jest setup)
- Linting is not configured (missing ESLint config)
- Docker services require manual setup
- Database migrations need proper Prisma configuration
- E2E tests require Playwright setup

## File Locations

### Configuration
- Root: `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.json`
- Apps: Each has own `package.json`, `tsconfig.json`
- Environment: `.env.example` (copy from `env_example.sh`)

### Key Files to Check After Changes
- Always verify `package.json` scripts in affected packages
- Check `tsconfig.json` configurations for TypeScript changes
- Review `turbo.json` for build pipeline modifications
- Ensure `pnpm-workspace.yaml` includes all packages

## Development Workflow

1. Make changes to relevant packages/apps
2. Test locally: `pnpm run build && pnpm run format`
3. Start applications to verify functionality
4. Access employee portal at http://localhost:3000
5. Verify changes work as expected
6. Format and commit

Remember: This is a sophisticated multi-tenant platform with HIPAA compliance requirements. Always test thoroughly and follow the validation steps.