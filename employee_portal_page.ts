'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@benefits/ui/components/card';
import { Button } from '@benefits/ui/components/button';
import { Badge } from '@benefits/ui/components/badge';
import { Alert, AlertDescription } from '@benefits/ui/components/alert';
import { Progress } from '@benefits/ui/components/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@benefits/ui/components/tabs';
import { 
  Heart, 
  Eye, 
  Smile, 
  Shield, 
  DollarSign, 
  FileText, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useNotifications } from '@/hooks/useNotifications';
import { formatCurrency, formatDate } from '@benefits/shared/utils';

interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  pendingActions: number;
  monthlyContribution: number;
  annualDeductibleMet: number;
  annualDeductibleTotal: number;
  dependents: number;
  openEnrollmentDays?: number;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { enrollments, loading: enrollmentsLoading, refresh } = useEnrollments();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  useEffect(() => {
    if (user && enrollments) {
      calculateDashboardStats();
      fetchUpcomingDeadlines();
    }
  }, [user, enrollments]);

  const calculateDashboardStats = () => {
    if (!enrollments) return;

    const activePlans = enrollments.filter(e => e.status === 'ACTIVE');
    const monthlyContribution = activePlans.reduce((sum, e) => sum + e.employeeContribution, 0);
    
    setStats({
      totalPlans: enrollments.length,
      activePlans: activePlans.length,
      pendingActions: notifications?.filter(n => n.status === 'PENDING').length || 0,
      monthlyContribution,
      annualDeductibleMet: 1250, // This would come from actual data
      annualDeductibleTotal: 3000, // This would come from actual data
      dependents: user?.employee?.dependents?.length || 0,
      openEnrollmentDays: calculateOpenEnrollmentDays(),
    });
  };

  const calculateOpenEnrollmentDays = () => {
    // This would be calculated from actual enrollment period data
    const enrollmentEndDate = new Date('2025-11-15');
    const today = new Date();
    const daysLeft = Math.ceil((enrollmentEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : undefined;
  };

  const fetchUpcomingDeadlines = async () => {
    // Fetch upcoming deadlines from API
    const deadlines = [
      { id: 1, title: 'Open Enrollment Ends', date: '2025-11-15', type: 'enrollment' },
      { id: 2, title: 'FSA Claims Deadline', date: '2025-12-31', type: 'claim' },
      { id: 3, title: 'Dependent Verification Due', date: '2025-10-01', type: 'verification' },
    ];
    setUpcomingDeadlines(deadlines);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'MEDICAL': return <Heart className="h-5 w-5" />;
      case 'DENTAL': return <Smile className="h-5 w-5" />;
      case 'VISION': return <Eye className="h-5 w-5" />;
      case 'LIFE': return <Shield className="h-5 w-5" />;
      case 'FSA': case 'HSA': return <DollarSign className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'TERMINATED': return 'destructive';
      default: return 'default';
    }
  };

  if (authLoading || enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your benefits and track your healthcare expenses all in one place.
        </p>
      </div>

      {/* Open Enrollment Alert */}
      {stats?.openEnrollmentDays && stats.openEnrollmentDays > 0 && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Open Enrollment is here!</strong> You have {stats.openEnrollmentDays} days left to make changes to your benefits.
            <Button 
              variant="link" 
              className="ml-2 text-blue-600 hover:text-blue-800 p-0"
              onClick={() => router.push('/enrollment')}
            >
              Review your options →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePlans || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalPlans || 0} total plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.monthlyContribution || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Employee contribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductible Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats?.annualDeductibleMet || 0) / (stats?.annualDeductibleTotal || 1) * 100)}%
            </div>
            <Progress 
              value={(stats?.annualDeductibleMet || 0) / (stats?.annualDeductibleTotal || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Covered Lives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.dependents || 0) + 1}</div>
            <p className="text-xs text-muted-foreground">
              You + {stats?.dependents || 0} dependent(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="benefits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="benefits">My Benefits</TabsTrigger>
          <TabsTrigger value="actions">Pending Actions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="claims">Recent Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="benefits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments?.filter(e => e.status === 'ACTIVE').map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/benefits/${enrollment.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(enrollment.plan.type)}
                      <CardTitle className="text-lg">{enrollment.plan.displayName}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  <CardDescription>{enrollment.plan.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage Level:</span>
                      <span className="font-medium">{enrollment.coverageLevel.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Cost:</span>
                      <span className="font-medium">{formatCurrency(enrollment.employeeContribution)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Date:</span>
                      <span className="font-medium">{formatDate(enrollment.effectiveDate)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      ID Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {enrollments?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Benefits</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any active benefit plans. Start by enrolling in available plans.
                </p>
                <Button onClick={() => router.push('/enrollment')}>
                  Browse Available Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {notifications?.filter(n => n.status === 'PENDING').map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-base">{notification.subject}</CardTitle>
                  </div>
                  <Button size="sm" onClick={() => markAsRead(notification.id)}>
                    Mark as Done
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{notification.content}</p>
              </CardContent>
            </Card>
          ))}

          {(!notifications || notifications.filter(n => n.status === 'PENDING').length === 0) && (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-gray-600">
                  You don't have any pending actions at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Access your benefit documents, ID cards, and forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Activity</CardTitle>
              <CardDescription>
                Track your recent claims and reimbursements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No recent claims to display</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Don't miss these important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(deadline.date)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Set Reminder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}