# Benefits Platform - Copilot Instructions

## Project Context
We are building a HIPAA-compliant employee benefits platform with AI-powered enrollment assistance.

## Code Style Preferences
- TypeScript for all Node.js code
- Functional components with hooks for React
- Async/await over callbacks
- Comprehensive error handling
- JSDoc comments for public APIs

## Security Requirements
- NEVER log PII/PHI data
- Always encrypt sensitive data at rest
- Use parameterized queries (no SQL concatenation)
- Validate all user inputs
- Implement rate limiting on all endpoints

## Key Patterns

## Common Imports

### Services (NestJS)
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
```

### React Components
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
```

## Avoid
- Direct database queries in controllers
- Storing passwords in plain text
- Synchronous file operations
- console.log in production code
- Any `any` types without justification

### API Endpoints
```typescript
// Always follow this pattern for NestJS controllers
@Post('/endpoint')
@UseGuards(AuthGuard, RoleGuard)
@ApiOperation({ summary: 'Description' })
async methodName(@Body() dto: ValidatedDTO): Promise<ResponseType> {
  try {
    // Implementation
    await this.auditService.log('ACTION', userId, data);
    return response;
  } catch (error) {
    this.logger.error('Context', error);
    throw new HttpException('User-friendly message', HttpStatus.CODE);
  }
}
```
