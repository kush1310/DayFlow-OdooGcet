import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, TrendingUp, Users, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyticsAPI, employeeAPI } from '@/services/api';
import { toast } from 'sonner';

// Default colors for department chart
const DEPARTMENT_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e'];

export default function Analytics() {
  const isLoading = useSkeletonLoading(1500);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgAttendance: '0%',
    leaveRate: '0%',
    avgHours: '0h',
    growth: '0%'
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [attendanceRes, leaveTrendsRes, employeeStatsRes] = await Promise.all([
          analyticsAPI.getAttendanceAnalytics(),
          analyticsAPI.getLeaveTrends(),
          employeeAPI.getStatistics()
        ]);

        // Process attendance data
        if (attendanceRes.data && attendanceRes.data.length > 0) {
          setAttendanceData(attendanceRes.data);
        } else {
          setAttendanceData([]);
        }

        // Process leave trends
        if (leaveTrendsRes.trends && leaveTrendsRes.trends.length > 0) {
          setLeaveData(leaveTrendsRes.trends);
        } else {
          setLeaveData([]);
        }

        // Process department statistics
        if (employeeStatsRes.departments && employeeStatsRes.departments.length > 0) {
          const deptData = employeeStatsRes.departments.map((dept: any, index: number) => ({
            name: dept.name || dept.department,
            value: dept.count || dept.value || 0,
            color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
          }));
          setDepartmentData(deptData);
        } else {
          setDepartmentData([]);
        }

        // Calculate statistics
        if (attendanceRes.stats) {
          setStats({
            avgAttendance: attendanceRes.stats.avgAttendance || '0%',
            leaveRate: attendanceRes.stats.leaveRate || '0%',
            avgHours: attendanceRes.stats.avgHours || '0h',
            growth: attendanceRes.stats.growth || '0%'
          });
        }

      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load some analytics data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchAnalytics();
    }
  }, [isLoading]);

  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedContainer>
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20"
          >
            <BarChart3 className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">HR insights and trends</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Attendance', value: stats.avgAttendance, icon: Users, color: 'from-emerald-500 to-teal-500' },
            { label: 'Leave Rate', value: stats.leaveRate, icon: Calendar, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Hours', value: stats.avgHours, icon: Clock, color: 'from-blue-500 to-cyan-500' },
            { label: 'Growth', value: stats.growth, icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} w-fit mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <h3 className="font-semibold mb-4">Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card"
          >
            <h3 className="font-semibold mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="stat-card"
        >
          <h3 className="font-semibold mb-4">Leave Patterns</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={leaveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              <Line type="monotone" dataKey="sick" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="casual" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
