import { getPrismaClient } from './client';

export class BaseModel {
  protected prisma = getPrismaClient();
  
  constructor(protected tenantId?: string) {
    if (tenantId) {
      this.prisma = getPrismaClient(tenantId);
    }
  }
}

export class UserModel extends BaseModel {
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { 
        email,
        tenantId: this.tenantId 
      },
    });
  }
  
  async create(data: any) {
    return this.prisma.user.create({
      data: {
        ...data,
        tenantId: this.tenantId,
      },
    });
  }
}

export class PlanModel extends BaseModel {
  async findActive() {
    return this.prisma.plan.findMany({
      where: {
        isActive: true,
        tenantId: this.tenantId,
      },
    });
  }
  
  async findById(id: string) {
    return this.prisma.plan.findFirst({
      where: {
        id,
        tenantId: this.tenantId,
      },
    });
  }
}

export class EnrollmentModel extends BaseModel {
  async findByEmployee(employeeId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        employeeId,
        tenantId: this.tenantId,
      },
      include: {
        plan: true,
        dependents: true,
      },
    });
  }
  
  async create(data: any) {
    return this.prisma.enrollment.create({
      data: {
        ...data,
        tenantId: this.tenantId,
      },
    });
  }
}
