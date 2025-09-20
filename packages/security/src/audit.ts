import { logger } from '@benefits/observability';

export function auditMiddleware(req: any, res: any, next: any) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    userId: req.auth?.sub,
    tenantId: req.tenantId,
    action: `${req.method} ${req.path}`,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id,
  };
  
  logger.info('Audit log', auditLog);
  next();
}
