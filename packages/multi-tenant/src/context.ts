export class TenantContext {
  private static instance: TenantContext;
  private tenantId: string | null = null;
  
  static getInstance(): TenantContext {
    if (!TenantContext.instance) {
      TenantContext.instance = new TenantContext();
    }
    return TenantContext.instance;
  }
  
  setTenant(tenantId: string): void {
    this.tenantId = tenantId;
  }
  
  getTenant(): string | null {
    return this.tenantId;
  }
  
  clearTenant(): void {
    this.tenantId = null;
  }
}

export const tenantContext = TenantContext.getInstance();
