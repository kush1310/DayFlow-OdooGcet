import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Users, UserCheck, Calendar, ClipboardList, Clock, TrendingUp, IndianRupee, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { getIndianGreeting, formatINR } from '@/utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isLoading = useSkeletonLoading(1500);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedContainer>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">DayFlow HR Suite</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            {getIndianGreeting()}, <span className="gradient-text">{user?.firstName}!</span>
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Here\'s what\'s happening with your team today.' : 'Here\'s your work overview for today.'}
          </p>
        </motion.div>

        {/* Stats */}
        {isAdmin ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
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
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Quick Actions
            </h2>
            <QuickActions />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isAdmin ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="stat-card"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Team Overview
                </h3>
                <AnimatedList className="space-y-3">
                  {[
                    { name: 'Rajesh Kumar', dept: 'Engineering', status: 'present' },
                    { name: 'Priya Sharma', dept: 'Design', status: 'present' },
                    { name: 'Amit Patel', dept: 'Marketing', status: 'leave' },
                    { name: 'Sneha Gupta', dept: 'Sales', status: 'present' },
                    { name: 'Arjun Singh', dept: 'Engineering', status: 'half-day' },
                  ].map((employee, i) => (
                    <AnimatedListItem key={i}>
                      <motion.div 
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
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
                      </motion.div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="stat-card"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  This Week's Attendance
                </h3>
                <div className="grid grid-cols-5 gap-2 lg:gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                    const statuses = ['present', 'present', 'present', 'half-day', 'present'];
                    const status = statuses[i];
                    return (
                      <motion.div 
                        key={day} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 lg:p-4 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-xs text-muted-foreground mb-2">{day}</p>
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                          status === 'present' ? 'bg-emerald-500' : 
                          status === 'half-day' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <p className="text-xs font-medium">
                          {status === 'present' ? '8h' : status === 'half-day' ? '4h' : '-'}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Monthly Summary */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">22</p>
                      <p className="text-xs text-muted-foreground">Present Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">2</p>
                      <p className="text-xs text-muted-foreground">Leaves Taken</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">176h</p>
                      <p className="text-xs text-muted-foreground">Work Hours</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <RecentActivity />
          </div>
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
