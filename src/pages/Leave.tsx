import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestForm } from '@/components/leave/LeaveRequestForm';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest, LeaveType } from '@/types/hrms';
import { Calendar, TreePalm, Stethoscope, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { leaveAPI } from '@/services/api';
import { toast } from 'sonner';

export default function Leave() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState({ earnedLeave: 0, sickLeave: 0, casualLeave: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, balanceData] = await Promise.all([
          leaveAPI.getMyRequests(),
          leaveAPI.getBalance()
        ]);
        setLeaveRequests(leavesData.leaves || []);
        setBalance(balanceData);
      } catch (error) {
        console.error('Failed to fetch leave data:', error);
        toast.error('Failed to load leave data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [isLoading]);

  const handleSubmit = async (data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string }) => {
    try {
      await leaveAPI.submitRequest(data);
      toast.success('Leave request submitted successfully!');

      // Refresh leave requests
      const leavesData = await leaveAPI.getMyRequests();
      setLeaveRequests(leavesData.leaves || []);
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const leaveBalance = [
    { type: 'Earned Leave', balance: balance.earnedLeave, total: 18, icon: TreePalm, color: 'from-emerald-500 to-teal-500' },
    { type: 'Sick Leave', balance: balance.sickLeave, total: 12, icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
    { type: 'Casual Leave', balance: balance.casualLeave, total: 8, icon: Wallet, color: 'from-purple-500 to-pink-500' },
  ];

  if (isLoading || dataLoading) {
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
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
          >
            <Calendar className="h-6 w-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Leave Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your time off requests</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaveBalance.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {item.balance}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">of {item.total}</p>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.type}
                    </h3>
                    <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.balance / item.total) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard delay={0.3}>
            <LeaveRequestForm onSubmit={handleSubmit} />
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <LeaveRequestList requests={leaveRequests} />
          </AnimatedCard>
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
