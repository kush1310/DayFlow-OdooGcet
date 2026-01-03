import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest } from '@/types/hrms';
import { toast } from 'sonner';
import { ClipboardCheck, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { leaveAPI } from '@/services/api';

export default function LeaveApprovals() {
  const isLoading = useSkeletonLoading(1500);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await leaveAPI.getAllRequests(filter === 'all' ? undefined : filter);
        setRequests(data.leaves || []);
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        toast.error('Failed to load leave requests');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchRequests();
    }
  }, [filter, isLoading]);

  const handleApprove = async (id: string) => {
    try {
      await leaveAPI.approveRequest(id, 'Approved by HR');
      toast.success('Leave approved! Employee has been notified via email 📧');

      // Refresh the list
      const data = await leaveAPI.getAllRequests(filter === 'all' ? undefined : filter);
      setRequests(data.leaves || []);
    } catch (error) {
      console.error('Failed to approve leave:', error);
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveAPI.rejectRequest(id, 'Rejected by HR');
      toast.success('Leave rejected. Employee has been notified via email 📧');

      // Refresh the list
      const data = await leaveAPI.getAllRequests(filter === 'all' ? undefined : filter);
      setRequests(data.leaves || []);
    } catch (error) {
      console.error('Failed to reject leave:', error);
      toast.error('Failed to reject leave request');
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="table" />
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
            <ClipboardCheck className="h-6 w-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Leave Approvals
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and approve leave requests</p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-pink-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === status
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LeaveRequestList
            requests={requests}
            showActions
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </motion.div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
