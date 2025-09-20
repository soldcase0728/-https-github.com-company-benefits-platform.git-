import { logger } from '@benefits/observability';

export function tenantMiddleware(req: any, res: any, next: any) {
  let tenantId = null;
  
  const host = req.get('host');
  if (host) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      tenantId = subdomain;
    }
  }
  
  if (!tenantId && req.headers['x-tenant-id']) {
    tenantId = req.headers['x-tenant-id'];
  }
  
  if (!tenantId && req.auth?.tenantId) {
    tenantId = req.auth.tenantId;
  }
  
  if (!tenantId && req.query.tenantId) {
    tenantId = req.query.tenantId;
  }
  
  if (!tenantId && process.env.NODE_ENV === 'development') {
    tenantId = 'default';
  }
  
  if (!tenantId) {
    logger.warn('No tenant ID found in request');
    return res.status(400).json({ error: 'Tenant identification required' });
  }
  
  req.tenantId = tenantId;
  req.dbContext = {
    tenantId,
    schema: `tenant_${tenantId}`,
  };
  
  logger.debug(`Request tenant: ${tenantId}`);
  next();
}
