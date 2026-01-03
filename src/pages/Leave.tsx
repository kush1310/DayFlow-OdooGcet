import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestForm } from '@/components/leave/LeaveRequestForm';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest, LeaveType } from '@/types/hrms';
import { Calendar, Clock, TreePalm, Stethoscope, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Rajesh Kumar',
    leaveType: 'paid',
    startDate: '2026-01-15',
    endDate: '2026-01-17',
    reason: 'Family function - wedding ceremony',
    status: 'approved',
    appliedOn: '2026-01-02',
    adminComment: 'Approved. Enjoy the function!',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Rajesh Kumar',
    leaveType: 'sick',
    startDate: '2025-12-20',
    endDate: '2025-12-21',
    reason: 'Fever and cold, need rest',
    status: 'approved',
    appliedOn: '2025-12-19',
  },
];

export default function Leave() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  const handleSubmit = (data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string }) => {
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: `${user?.firstName} ${user?.lastName}`,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests([newRequest, ...leaveRequests]);
  };

  const leaveBalance = [
    { type: 'Earned Leave', balance: 12, total: 18, icon: TreePalm, color: 'from-emerald-500 to-teal-500' },
    { type: 'Sick Leave', balance: 8, total: 12, icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
    { type: 'Casual Leave', balance: 5, total: 8, icon: Wallet, color: 'from-purple-500 to-pink-500' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="form" />
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
            <Calendar className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">Apply for leave and track your balance</p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {leaveBalance.map((item, i) => (
            <AnimatedCard key={item.type} delay={i * 0.1} className="stat-card overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">{item.balance}</span>
                    <span className="text-sm text-muted-foreground">/ {item.total} days</span>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.balance / item.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {item.total - item.balance} days used this year
              </p>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LeaveRequestForm onSubmit={handleSubmit} />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              My Leave Requests
            </h3>
            <LeaveRequestList requests={leaveRequests} />
          </motion.div>
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
