import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Users, UserCheck, Calendar, ClipboardList, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Here\'s what\'s happening with your team today.' : 'Here\'s your work overview for today.'}
          </p>
        </div>

        {/* Stats */}
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Employees"
              value={48}
              icon={Users}
              variant="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Present Today"
              value={42}
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              title="On Leave"
              value={6}
              icon={Calendar}
              variant="warning"
            />
            <StatCard
              title="Pending Requests"
              value={8}
              icon={ClipboardList}
              variant="info"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Days Present (This Month)"
              value={18}
              icon={UserCheck}
              variant="success"
            />
            <StatCard
              title="Leave Balance"
              value={12}
              icon={Calendar}
              variant="primary"
            />
            <StatCard
              title="Avg. Work Hours"
              value="8.5h"
              icon={Clock}
              variant="info"
            />
          </div>
        )}

        {/* Quick Actions - Employee Only */}
        {!isAdmin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <QuickActions />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isAdmin ? (
              <div className="stat-card">
                <h3 className="font-semibold mb-4">Team Overview</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Michael Chen', dept: 'Engineering', status: 'present' },
                    { name: 'Emma Wilson', dept: 'Design', status: 'present' },
                    { name: 'James Brown', dept: 'Marketing', status: 'leave' },
                    { name: 'Lisa Anderson', dept: 'Sales', status: 'present' },
                    { name: 'David Kim', dept: 'Engineering', status: 'half-day' },
                  ].map((employee, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.dept}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${
                        employee.status === 'present' ? 'status-present' : 
                        employee.status === 'leave' ? 'status-leave' : 'status-halfday'
                      }`}>
                        {employee.status === 'half-day' ? 'Half Day' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="stat-card">
                <h3 className="font-semibold mb-4">This Week's Attendance</h3>
                <div className="grid grid-cols-5 gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                    const statuses = ['present', 'present', 'present', 'half-day', 'present'];
                    const status = statuses[i];
                    return (
                      <div key={day} className="text-center p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2">{day}</p>
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                          status === 'present' ? 'bg-success' : 
                          status === 'half-day' ? 'bg-info' : 'bg-destructive'
                        }`} />
                        <p className="text-xs font-medium">
                          {status === 'present' ? '8h' : status === 'half-day' ? '4h' : '-'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
