export interface AuthUser {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  tenantId?: string;
}

export function extractUser(req: any): AuthUser | null {
  if (!req.auth) return null;
  
  return {
    sub: req.auth.sub,
    email: req.auth.email,
    role: req.auth.role || 'EMPLOYEE',
    permissions: req.auth.permissions || [],
    tenantId: req.tenantId,
  };
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission) || user.role === 'SUPER_ADMIN';
}

export function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    const user = extractUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(user, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
