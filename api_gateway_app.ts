import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Internal packages
import { logger, requestLogger } from '@benefits/observability';
import { tenantMiddleware } from '@benefits/multi-tenant';
import { auditMiddleware } from '@benefits/security';
import { metricsMiddleware } from '@benefits/observability/metrics';
import { tracingMiddleware } from '@benefits/observability/tracing';
import { errorHandler } from '@benefits/shared/errors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 4000;

// ==================== MIDDLEWARE CONFIGURATION ====================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.EMPLOYEE_PORTAL_URL,
      process.env.ADMIN_DASHBOARD_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing and compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Request ID injection
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('x-request-id', req.id);
  next();
});

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));
app.use(requestLogger);

// Metrics and tracing
app.use(metricsMiddleware);
app.use(tracingMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// ==================== AUTHENTICATION ====================

// JWT middleware configuration
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Apply authentication to protected routes
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for health checks and public endpoints
  if (req.path === '/health' || req.path.startsWith('/public')) {
    return next();
  }
  checkJwt(req, res, next);
});

// Multi-tenancy middleware
app.use('/api', tenantMiddleware);

// Audit logging middleware
app.use('/api', auditMiddleware);

// ==================== HEALTH & STATUS ENDPOINTS ====================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection
    // await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    // await redis.ping();
    
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// ==================== SERVICE ROUTING ====================

// Microservice endpoints configuration
const serviceEndpoints = {
  enrollment: process.env.ENROLLMENT_SERVICE_URL || 'http://enrollment-service:3100',
  benefits: process.env.BENEFITS_SERVICE_URL || 'http://benefits-service:3101',
  documents: process.env.DOCUMENTS_SERVICE_URL || 'http://documents-service:3102',
  carriers: process.env.CARRIERS_SERVICE_URL || 'http://carriers-service:3103',
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://notifications-service:3104',
  reporting: process.env.REPORTING_SERVICE_URL || 'http://reporting-service:3105',
  rules: process.env.RULES_SERVICE_URL || 'http://rules-service:3106',
  ai: process.env.AI_SERVICE_URL || 'http://ai-service:3107',
};

// Enrollment Service
app.use('/api/enrollments', createProxyMiddleware({
  target: serviceEndpoints.enrollment,
  changeOrigin: true,
  pathRewrite: { '^/api/enrollments': '/enrollments' },
  onProxyReq: (proxyReq, req: Request) => {
    // Forward tenant context
    if (req.tenantId) {
      proxyReq.setHeader('x-tenant-id', req.tenantId);
    }
    // Forward user context
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    // Forward request ID
    proxyReq.setHeader('x-request-id', req.id);
  },
  onError: (err, req, res) => {
    logger.error('Proxy error:', err);
    res.status(502).json({ error: 'Service temporarily unavailable' });
  },
}));

// Benefits Service
app.use('/api/benefits', createProxyMiddleware({
  target: serviceEndpoints.benefits,
  changeOrigin: true,
  pathRewrite: { '^/api/benefits': '/benefits' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Documents Service
app.use('/api/documents', createProxyMiddleware({
  target: serviceEndpoints.documents,
  changeOrigin: true,
  pathRewrite: { '^/api/documents': '/documents' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Carriers Integration Service
app.use('/api/carriers', createProxyMiddleware({
  target: serviceEndpoints.carriers,
  changeOrigin: true,
  pathRewrite: { '^/api/carriers': '/carriers' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Notifications Service
app.use('/api/notifications', createProxyMiddleware({
  target: serviceEndpoints.notifications,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/notifications' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Reporting Service
app.use('/api/reports', createProxyMiddleware({
  target: serviceEndpoints.reporting,
  changeOrigin: true,
  pathRewrite: { '^/api/reports': '/reports' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Rules Engine Service
app.use('/api/rules', createProxyMiddleware({
  target: serviceEndpoints.rules,
  changeOrigin: true,
  pathRewrite: { '^/api/rules': '/rules' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// AI Service
app.use('/api/ai', createProxyMiddleware({
  target: serviceEndpoints.ai,
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/ai' },
  onProxyReq: (proxyReq, req: Request) => {
    if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
    if (req.auth) {
      proxyReq.setHeader('x-user-id', req.auth.sub);
      proxyReq.setHeader('x-user-role', req.auth.role);
    }
    proxyReq.setHeader('x-request-id', req.id);
  },
}));

// ==================== GRAPHQL ENDPOINT ====================

if (process.env.ENABLE_GRAPHQL === 'true') {
  app.use('/graphql', createProxyMiddleware({
    target: process.env.GRAPHQL_SERVICE_URL || 'http://graphql-service:3200',
    changeOrigin: true,
    ws: true, // Enable WebSocket for subscriptions
    onProxyReq: (proxyReq, req: Request) => {
      if (req.tenantId) proxyReq.setHeader('x-tenant-id', req.tenantId);
      if (req.auth) {
        proxyReq.setHeader('x-user-id', req.auth.sub);
        proxyReq.setHeader('x-user-role', req.auth.role);
      }
      proxyReq.setHeader('x-request-id', req.id);
    },
  }));
}

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  });
});

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    // await prisma.$disconnect();
    
    // Close Redis connection
    // await redis.quit();
    
    // Close other resources
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Services configured:`, Object.keys(serviceEndpoints));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Type extensions
declare global {
  namespace Express {
    interface Request {
      id: string;
      tenantId?: string;
      auth?: {
        sub: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export default app;