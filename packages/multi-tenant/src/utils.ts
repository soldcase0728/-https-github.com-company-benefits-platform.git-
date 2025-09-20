export function getTenantDbUrl(tenantId: string): string {
  const baseUrl = process.env.DATABASE_URL || '';
  return baseUrl.includes('?') 
    ? `${baseUrl}&schema=tenant_${tenantId}`
    : `${baseUrl}?schema=tenant_${tenantId}`;
}

export function validateTenantId(tenantId: string): boolean {
  const regex = /^[a-z0-9-]+$/;
  return regex.test(tenantId);
}
