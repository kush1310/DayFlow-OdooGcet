import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3, TrendingUp, Users, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const attendanceData = [
  { month: 'Aug', present: 42, absent: 3, leave: 3 },
  { month: 'Sep', present: 44, absent: 2, leave: 2 },
  { month: 'Oct', present: 40, absent: 4, leave: 4 },
  { month: 'Nov', present: 43, absent: 2, leave: 3 },
  { month: 'Dec', present: 41, absent: 3, leave: 4 },
  { month: 'Jan', present: 42, absent: 2, leave: 4 },
];

const departmentData = [
  { name: 'Engineering', value: 18, color: '#8b5cf6' },
  { name: 'Design', value: 8, color: '#ec4899' },
  { name: 'Marketing', value: 7, color: '#f59e0b' },
  { name: 'Sales', value: 10, color: '#10b981' },
  { name: 'HR', value: 5, color: '#3b82f6' },
];

const leaveData = [
  { month: 'Aug', earned: 12, sick: 8, casual: 5 },
  { month: 'Sep', earned: 10, sick: 6, casual: 4 },
  { month: 'Oct', earned: 14, sick: 9, casual: 6 },
  { month: 'Nov', earned: 11, sick: 7, casual: 5 },
  { month: 'Dec', earned: 16, sick: 10, casual: 8 },
  { month: 'Jan', earned: 13, sick: 8, casual: 6 },
];

export default function Analytics() {
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
            { label: 'Avg Attendance', value: '92%', icon: Users, color: 'from-emerald-500 to-teal-500' },
            { label: 'Leave Rate', value: '8%', icon: Calendar, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Hours', value: '8.2h', icon: Clock, color: 'from-blue-500 to-cyan-500' },
            { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
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
