import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

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
}));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.EMPLOYEE_PORTAL_URL,
    process.env.ADMIN_DASHBOARD_URL,
  ].filter(Boolean),
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
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

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
    // TODO: Check database connection
    // TODO: Check Redis connection
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// ==================== API ROUTES ====================

// Mock benefits endpoints
app.get('/api/benefits', (req: Request, res: Response) => {
  res.json({
    plans: [
      {
        id: '1',
        name: 'Premium Health Plan',
        type: 'MEDICAL',
        category: 'PPO',
        monthlyPremium: 450.00,
        description: 'Comprehensive health coverage with nationwide network'
      },
      {
        id: '2',
        name: 'Standard Dental Plan',
        type: 'DENTAL',
        category: 'PPO',
        monthlyPremium: 75.00,
        description: 'Complete dental coverage including preventive care'
      }
    ]
  });
});

app.get('/api/enrollments', (req: Request, res: Response) => {
  res.json({
    enrollments: [
      {
        id: '1',
        planId: '1',
        status: 'ACTIVE',
        effectiveDate: '2024-01-01',
        monthlyPremium: 450.00,
        coverageLevel: 'FAMILY'
      }
    ]
  });
});

app.get('/api/users/profile', (req: Request, res: Response) => {
  res.json({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'EMPLOYEE'
  });
});

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
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
    requestId: req.id,
  });
});

// ==================== SERVER STARTUP ====================

const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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