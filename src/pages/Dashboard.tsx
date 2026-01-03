import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, TrendingUp, Building2, BarChart, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { employeeAPI, analyticsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLoading = useSkeletonLoading(1500);
  const [stats, setStats] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsAPI.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchStats();
    }
  }, [isLoading]);

  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="dashboard" />
      </DashboardLayout>
    );
  }

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Present Today',
      value: stats?.presentToday || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'On Leave',
      value: stats?.onLeave || 0,
      icon: Building2,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: BarChart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <DashboardLayout>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here's what's happening with your team today
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <AnimatedCard key={stat.title} delay={index * 0.1}>
              <div className={`p-6 rounded-xl ${stat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Quick Actions */}
        <AnimatedCard delay={0.5}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/employees')}
                className="h-auto p-4 flex flex-col items-start bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="font-medium">View Employees</span>
                <span className="text-xs opacity-80 mt-1">Manage team members</span>
              </Button>

              <Button
                onClick={() => navigate('/leave-approvals')}
                className="h-auto p-4 flex flex-col items-start bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <BarChart className="h-6 w-6 mb-2" />
                <span className="font-medium">Leave Approvals</span>
                <span className="text-xs opacity-80 mt-1">{stats?.pendingRequests || 0} pending</span>
              </Button>

              <Button
                onClick={() => navigate('/analytics')}
                className="h-auto p-4 flex flex-col items-start bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="font-medium">Analytics</span>
                <span className="text-xs opacity-80 mt-1">View reports</span>
              </Button>
            </div>
          </div>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={0.6} className="mt-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  All systems operational
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Database: Connected (hrms)
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Email service: Active (Brevo SMTP)
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
