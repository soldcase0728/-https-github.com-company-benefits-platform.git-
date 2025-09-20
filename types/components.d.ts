
/// <reference types="react" />

declare module '@componentsix/mobileHealthScore' {
  export interface HealthScoreProps {
    userId?: string;
    score?: number;
    showDetails?: boolean;
    onUpdate?: (score: number) => void;
  }
  const MobileHealthScore: React.FC<HealthScoreProps>;
  export default MobileHealthScore;
}

declare module '@benefitsjs/employee-portal' {
  export interface EmployeePortalConfig {
    apiUrl?: string;
    tenantId?: string;
    theme?: 'light' | 'dark';
  }
  export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    enrollments?: Enrollment[];
  }
  export interface Enrollment {
    id: string;
    planId: string;
    planName: string;
    status: 'ACTIVE' | 'PENDING' | 'TERMINATED';
    effectiveDate: string;
    coverageLevel: string;
  }
  export interface Plan {
    id: string;
    name: string;
    type: 'MEDICAL' | 'DENTAL' | 'VISION' | 'LIFE' | 'DISABILITY';
    carrier: string;
    premium: number;
    description?: string;
  }
  export const Dashboard: React.ComponentType<{ employee?: Employee }>;
  export const EnrollmentFlow: React.ComponentType<{ plans: Plan[] }>;
  export const BenefitsComparison: React.ComponentType<{ plans: Plan[] }>;
  export const ProfileManager: React.ComponentType<{ employee: Employee }>;
  export function useEmployee(): Employee | null;
  export function useEnrollments(): Enrollment[];
  export function usePlans(): Plan[];
  export const EmployeePortalProvider: React.ComponentType<{
    children: React.ReactNode;
    config?: EmployeePortalConfig;
  }>;
  export function formatCurrency(amount: number): string;
  export function formatDate(date: string | Date): string;
  export function calculatePremium(plan: Plan, coverageLevel: string): number;
}

declare module '@benefitsjs/admin-dashboard' {
  export interface AdminConfig {
    apiUrl?: string;
    authProvider?: 'auth0' | 'okta' | 'custom';
    permissions?: string[];
  }
  export interface Organization {
    id: string;
    name: string;
    domain: string;
    employeeCount: number;
    plans: string[];
  }
  export interface AdminUser {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'HR_STAFF';
    permissions: string[];
  }
  export interface Report {
    id: string;
    type: 'ENROLLMENT' | 'COST' | 'USAGE' | 'COMPLIANCE';
    generatedAt: string;
    data: any;
  }
  export const AdminDashboard: React.ComponentType<{ user: AdminUser }>;
  export const PlanManager: React.ComponentType<{ organizationId: string }>;
  export const EmployeeManager: React.ComponentType<{ organizationId: string }>;
  export const ReportsPanel: React.ComponentType<{ reports: Report[] }>;
  export const DocumentAI: React.ComponentType<{ onUpload: (file: File) => void }>;
  export function useAdminAuth(): AdminUser | null;
  export function useOrganization(id: string): Organization | null;
  export function useReports(type?: string): Report[];
  export const AdminDashboardProvider: React.ComponentType<{
    children: React.ReactNode;
    config?: AdminConfig;
  }>;
  export function uploadDocument(file: File): Promise<any>;
  export function generateReport(type: string, params: any): Promise<Report>;
  export function exportData(format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob>;
}

declare module '@benefits/ui' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
  }
  export const Button: React.FC<ButtonProps>;
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
  }
  export const Input: React.FC<InputProps>;
  export interface CardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }
  export const Card: React.FC<CardProps>;
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;
}

declare module '@benefits/database' {
  export interface PrismaClient {
    user: any;
    employee: any;
    enrollment: any;
    plan: any;
    tenant: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
  export const prisma: PrismaClient;
}

declare module '@benefits/shared' {
  export const PLAN_TYPES: readonly ['MEDICAL', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY'];
  export const ENROLLMENT_STATUS: readonly ['ACTIVE', 'PENDING', 'TERMINATED', 'CANCELLED'];
  export function validateSSN(ssn: string): boolean;
  export function validateEmail(email: string): boolean;
  export function formatPhoneNumber(phone: string): string;
  export function calculateAge(birthDate: Date | string): number;
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
}

declare module '@benefits/security' {
  export function hashPassword(password: string): Promise<string>;
  export function verifyPassword(password: string, hash: string): Promise<boolean>;
  export function generateToken(payload: any): string;
  export function verifyToken(token: string): any;
  export function encryptPII(data: string): string;
  export function decryptPII(encrypted: string): string;
}

declare module '@benefits/multi-tenant' {
  export interface Tenant {
    id: string;
    name: string;
    domain: string;
    settings: any;
  }
  export function tenantMiddleware(req: any, res: any, next: any): void;
  export function getTenantFromRequest(req: any): Tenant | null;
  export function setTenantContext(tenantId: string): void;
}

declare module '@benefits/observability' {
  export interface Logger {
    info(message: string, meta?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
  }
  export const logger: Logger;
  export function trackEvent(name: string, properties?: any): void;
  export function startSpan(name: string): any;
  export function endSpan(span: any): void;
  export interface Metrics {
    increment(metric: string, value?: number, tags?: any): void;
    gauge(metric: string, value: number, tags?: any): void;
    histogram(metric: string, value: number, tags?: any): void;
  }
  export const metrics: Metrics;
}

declare module '@benefits/document-ai' {
  export interface ExtractionResult {
    documentType: 'SPD' | 'CONTRACT' | 'RIDER' | 'BILLING' | 'OTHER';
    confidence: number;
    extractedData: {
      planName?: string;
      carrier?: string;
      effectiveDate?: string;
      benefits?: any[];
      costs?: any[];
    };
    rawText: string;
  }
  export function processDocument(file: Buffer | Uint8Array): Promise<ExtractionResult>;
  export function classifyDocument(text: string): Promise<string>;
  export function extractTables(pdfBuffer: Buffer): Promise<any[]>;
}

declare module '@benefits/rules-engine' {
  export interface Rule {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
  }
  export interface RuleContext {
    employee: any;
    plan: any;
    enrollment: any;
    [key: string]: any;
  }
  export function evaluateRules(rules: Rule[], context: RuleContext): Promise<any[]>;
  export function validateEligibility(employee: any, plan: any): Promise<boolean>;
  export function calculatePremium(context: RuleContext): Promise<number>;
}

declare module '@benefits/carrier-middleware' {
  export interface CarrierConfig {
    name: string;
    type: 'REST' | 'SOAP' | 'SFTP' | 'EDI';
    endpoint: string;
    credentials: any;
  }
  export interface EDITransaction {
    type: '834' | '820' | '835';
    data: any;
    format: 'X12' | 'JSON';
  }
  export function submitEnrollment(carrierId: string, enrollment: any): Promise<any>;
  export function parseEDI(ediString: string): EDITransaction;
  export function generateEDI(transaction: EDITransaction): string;
  export function getCarrierStatus(carrierId: string, referenceId: string): Promise<any>;
}

declare module '@benefits/auth' {
  export interface User {
    id: string;
    email: string;
    roles: string[];
    tenantId?: string;
  }
  export interface AuthRequest {
    user?: User;
    [key: string]: any;
  }
  export function authenticate(token: string): Promise<User>;
  export function authorize(user: User, resource: string, action: string): boolean;
  export function createSession(user: User): Promise<string>;
  export function destroySession(sessionId: string): Promise<void>;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '@benefitsjs/employee-portal' {
declare module '@benefitsjs/admin-dashboard' {



// Mobile Health Score Component
declare module '@componentsix/mobileHealthScore' {
  export interface HealthScoreProps {
    userId?: string;
    score?: number;
    showDetails?: boolean;
    onUpdate?: (score: number) => void;
  }
  const MobileHealthScore: React.FC<HealthScoreProps>;
  export default MobileHealthScore;
}

// Employee Portal Module
declare module '@benefitsjs/employee-portal' {
  export interface EmployeePortalConfig {
    apiUrl?: string;
    tenantId?: string;
    theme?: 'light' | 'dark';
  }
  export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    enrollments?: Enrollment[];
  }
  export interface Enrollment {
    id: string;
    planId: string;
    planName: string;
    status: 'ACTIVE' | 'PENDING' | 'TERMINATED';
    effectiveDate: string;
    coverageLevel: string;
  }
  export interface Plan {
    id: string;
    name: string;
    type: 'MEDICAL' | 'DENTAL' | 'VISION' | 'LIFE' | 'DISABILITY';
    carrier: string;
    premium: number;
    description?: string;
  }
  // Components
  export const Dashboard: React.ComponentType<{ employee?: Employee }>;
  export const EnrollmentFlow: React.ComponentType<{ plans: Plan[] }>;
  export const BenefitsComparison: React.ComponentType<{ plans: Plan[] }>;
  export const ProfileManager: React.ComponentType<{ employee: Employee }>;
  // Hooks
  export function useEmployee(): Employee | null;
  export function useEnrollments(): Enrollment[];
  export function usePlans(): Plan[];
  // Context Providers
  export const EmployeePortalProvider: React.ComponentType<{
    children: React.ReactNode;
    config?: EmployeePortalConfig;
  }>;
  // Utilities
  export function formatCurrency(amount: number): string;
  export function formatDate(date: string | Date): string;
  export function calculatePremium(plan: Plan, coverageLevel: string): number;
}

// Admin Dashboard Module
declare module '@benefitsjs/admin-dashboard' {
  export interface AdminConfig {
    apiUrl?: string;
    authProvider?: 'auth0' | 'okta' | 'custom';
    permissions?: string[];
  }
  export interface Organization {
    id: string;
    name: string;
    domain: string;
    employeeCount: number;
    plans: string[];
  }
  export interface AdminUser {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'HR_STAFF';
    permissions: string[];
  }
  export interface Report {
    id: string;
    type: 'ENROLLMENT' | 'COST' | 'USAGE' | 'COMPLIANCE';
    generatedAt: string;
    data: any;
  }
  // Components
  export const AdminDashboard: React.ComponentType<{ user: AdminUser }>;
  export const PlanManager: React.ComponentType<{ organizationId: string }>;
  export const EmployeeManager: React.ComponentType<{ organizationId: string }>;
  export const ReportsPanel: React.ComponentType<{ reports: Report[] }>;
  export const DocumentAI: React.ComponentType<{ onUpload: (file: File) => void }>;
  // Hooks
  export function useAdminAuth(): AdminUser | null;
  export function useOrganization(id: string): Organization | null;
  export function useReports(type?: string): Report[];
  // Context Providers
  export const AdminDashboardProvider: React.ComponentType<{
    children: React.ReactNode;
    config?: AdminConfig;
  }>;
  // API Functions
  export function uploadDocument(file: File): Promise<any>;
  export function generateReport(type: string, params: any): Promise<Report>;
  export function exportData(format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob>;
}

// Shared UI Components
declare module '@benefits/ui' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
  }
  export const Button: React.FC<ButtonProps>;
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
  }
  export const Input: React.FC<InputProps>;
  export interface CardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }
  export const Card: React.FC<CardProps>;
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;
}

// Database Package
declare module '@benefits/database' {
  export interface PrismaClient {
    user: any;
    employee: any;
    enrollment: any;
    plan: any;
    tenant: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
  export const prisma: PrismaClient;
  export default prisma;
}

// Shared Package
declare module '@benefits/shared' {
  // Constants
  export const PLAN_TYPES: readonly ['MEDICAL', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY'];
  export const ENROLLMENT_STATUS: readonly ['ACTIVE', 'PENDING', 'TERMINATED', 'CANCELLED'];
  // Utilities
  export function validateSSN(ssn: string): boolean;
  export function validateEmail(email: string): boolean;
  export function formatPhoneNumber(phone: string): string;
  export function calculateAge(birthDate: Date | string): number;
  // Types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
}

// Security Package
declare module '@benefits/security' {
  export function hashPassword(password: string): Promise<string>;
  export function verifyPassword(password: string, hash: string): Promise<boolean>;
  export function generateToken(payload: any): string;
  export function verifyToken(token: string): any;
  export function encryptPII(data: string): string;
  export function decryptPII(encrypted: string): string;
}

// Multi-tenant Package
declare module '@benefits/multi-tenant' {
  export interface Tenant {
    id: string;
    name: string;
    domain: string;
    settings: any;
  }
  export function tenantMiddleware(req: Express.Request, res: Express.Response, next: Express.NextFunction): void;
  export function getTenantFromRequest(req: Express.Request): Tenant | null;
  export function setTenantContext(tenantId: string): void;
}

// Observability Package
declare module '@benefits/observability' {
  export interface Logger {
    info(message: string, meta?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
  }
  export const logger: Logger;
  export function trackEvent(name: string, properties?: any): void;
  export function startSpan(name: string): any;
  export function endSpan(span: any): void;
  export interface Metrics {
    increment(metric: string, value?: number, tags?: any): void;
    gauge(metric: string, value: number, tags?: any): void;
    histogram(metric: string, value: number, tags?: any): void;
  }
  export const metrics: Metrics;
}

// Document AI Package
declare module '@benefits/document-ai' {
  export interface ExtractionResult {
    documentType: 'SPD' | 'CONTRACT' | 'RIDER' | 'BILLING' | 'OTHER';
    confidence: number;
    extractedData: {
      planName?: string;
      carrier?: string;
      effectiveDate?: string;
      benefits?: any[];
      costs?: any[];
    };
    rawText: string;
  }
  export function processDocument(file: Buffer | Uint8Array): Promise<ExtractionResult>;
  export function classifyDocument(text: string): Promise<string>;
  export function extractTables(pdfBuffer: Buffer): Promise<any[]>;
}

// Rules Engine Package
declare module '@benefits/rules-engine' {
  export interface Rule {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
  }
  export interface RuleContext {
    employee: any;
    plan: any;
    enrollment: any;
    [key: string]: any;
  }
  export function evaluateRules(rules: Rule[], context: RuleContext): Promise<any[]>;
  export function validateEligibility(employee: any, plan: any): Promise<boolean>;
  export function calculatePremium(context: RuleContext): Promise<number>;
}

// Carrier Middleware Package
declare module '@benefits/carrier-middleware' {
  export interface CarrierConfig {
    name: string;
    type: 'REST' | 'SOAP' | 'SFTP' | 'EDI';
    endpoint: string;
    credentials: any;
  }
  export interface EDITransaction {
    type: '834' | '820' | '835';
    data: any;
    format: 'X12' | 'JSON';
  }
  export function submitEnrollment(carrierId: string, enrollment: any): Promise<any>;
  export function parseEDI(ediString: string): EDITransaction;
  export function generateEDI(transaction: EDITransaction): string;
  export function getCarrierStatus(carrierId: string, referenceId: string): Promise<any>;
}

// Auth Package
declare module '@benefits/auth' {
  export interface User {
    id: string;
    email: string;
    roles: string[];
    tenantId?: string;
  }
  export interface AuthRequest extends Express.Request {
    user?: User;
  }
  export function authenticate(token: string): Promise<User>;
  export function authorize(user: User, resource: string, action: string): boolean;
  export function createSession(user: User): Promise<string>;
  export function destroySession(sessionId: string): Promise<void>;
}

// Database Package
declare module '@benefits/database' {
  export interface PrismaClient {
    user: any;
    employee: any;
    enrollment: any;
    plan: any;
    tenant: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
  
  export const prisma: PrismaClient;
  export default prisma;
}

// Shared Package
declare module '@benefits/shared' {
  // Constants
  export const PLAN_TYPES: readonly ['MEDICAL', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY'];
  export const ENROLLMENT_STATUS: readonly ['ACTIVE', 'PENDING', 'TERMINATED', 'CANCELLED'];
  
  // Utilities
  export function validateSSN(ssn: string): boolean;
  export function validateEmail(email: string): boolean;
  export function formatPhoneNumber(phone: string): string;
  export function calculateAge(birthDate: Date | string): number;
  
  // Types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
}

// Security Package
declare module '@benefits/security' {
  export function hashPassword(password: string): Promise<string>;
  export function verifyPassword(password: string, hash: string): Promise<boolean>;
  export function generateToken(payload: any): string;
  export function verifyToken(token: string): any;
  export function encryptPII(data: string): string;
  export function decryptPII(encrypted: string): string;
}

// Multi-tenant Package
declare module '@benefits/multi-tenant' {
  import { Request, Response, NextFunction } from 'express';
  
  export interface Tenant {
    id: string;
    name: string;
    domain: string;
    settings: any;
  }
  
  export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void;
  export function getTenantFromRequest(req: Request): Tenant | null;
  export function setTenantContext(tenantId: string): void;
}

// Observability Package
declare module '@benefits/observability' {
  export interface Logger {
    info(message: string, meta?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
  }
  
  export const logger: Logger;
  
  export function trackEvent(name: string, properties?: any): void;
  export function startSpan(name: string): any;
  export function endSpan(span: any): void;
  
  export interface Metrics {
    increment(metric: string, value?: number, tags?: any): void;
    gauge(metric: string, value: number, tags?: any): void;
    histogram(metric: string, value: number, tags?: any): void;
  }
  
  export const metrics: Metrics;
}

// Document AI Package
declare module '@benefits/document-ai' {
  export interface ExtractionResult {
    documentType: 'SPD' | 'CONTRACT' | 'RIDER' | 'BILLING' | 'OTHER';
    confidence: number;
    extractedData: {
      planName?: string;
      carrier?: string;
      effectiveDate?: string;
      benefits?: any[];
      costs?: any[];
    };
    rawText: string;
  }
  
  export function processDocument(file: Buffer | Uint8Array): Promise<ExtractionResult>;
  export function classifyDocument(text: string): Promise<string>;
  export function extractTables(pdfBuffer: Buffer): Promise<any[]>;
}

// Rules Engine Package
declare module '@benefits/rules-engine' {
  export interface Rule {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
  }
  
  export interface RuleContext {
    employee: any;
    plan: any;
    enrollment: any;
    [key: string]: any;
  }
  
  export function evaluateRules(rules: Rule[], context: RuleContext): Promise<any[]>;
  export function validateEligibility(employee: any, plan: any): Promise<boolean>;
  export function calculatePremium(context: RuleContext): Promise<number>;
}

// Carrier Middleware Package
declare module '@benefits/carrier-middleware' {
  export interface CarrierConfig {
    name: string;
    type: 'REST' | 'SOAP' | 'SFTP' | 'EDI';
    endpoint: string;
    credentials: any;
  }
  
  export interface EDITransaction {
    type: '834' | '820' | '835';
    data: any;
    format: 'X12' | 'JSON';
  }
  
  export function submitEnrollment(carrierId: string, enrollment: any): Promise<any>;
  export function parseEDI(ediString: string): EDITransaction;
  export function generateEDI(transaction: EDITransaction): string;
  export function getCarrierStatus(carrierId: string, referenceId: string): Promise<any>;
}

// Auth Package
declare module '@benefits/auth' {
  import { Request } from 'express';
  
  export interface User {
    id: string;
    email: string;
    roles: string[];
    tenantId?: string;
  }
  
  export interface AuthRequest extends Request {
    user?: User;
  }
  
  export function authenticate(token: string): Promise<User>;
  export function authorize(user: User, resource: string, action: string): boolean;
  export function createSession(user: User): Promise<string>;
  export function destroySession(sessionId: string): Promise<void>;
}

// Fix for any other common missing modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}
