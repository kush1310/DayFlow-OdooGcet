import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest } from '@/types/hrms';
import { toast } from 'sonner';
import { ClipboardCheck, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';

const initialRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Rajesh Kumar',
    leaveType: 'paid',
    startDate: '2026-01-15',
    endDate: '2026-01-17',
    reason: 'Family function - wedding ceremony in hometown',
    status: 'pending',
    appliedOn: '2026-01-02',
  },
  {
    id: '2',
    userId: '3',
    userName: 'Priya Sharma',
    leaveType: 'sick',
    startDate: '2026-01-10',
    endDate: '2026-01-10',
    reason: 'Doctor appointment at AIIMS',
    status: 'pending',
    appliedOn: '2026-01-08',
  },
  {
    id: '3',
    userId: '4',
    userName: 'Amit Patel',
    leaveType: 'unpaid',
    startDate: '2026-01-20',
    endDate: '2026-01-25',
    reason: 'Personal matter - family emergency in Gujarat',
    status: 'pending',
    appliedOn: '2026-01-01',
  },
  {
    id: '4',
    userId: '5',
    userName: 'Sneha Gupta',
    leaveType: 'paid',
    startDate: '2025-12-28',
    endDate: '2025-12-30',
    reason: 'New Year holiday travel to Goa',
    status: 'approved',
    appliedOn: '2025-12-15',
    adminComment: 'Approved for holiday period',
  },
];

export default function LeaveApprovals() {
  const isLoading = useSkeletonLoading(1500);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'approved', adminComment: 'Approved by HR' } : req
    ));
    toast.success('Leave request approved! ✅');
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'rejected', adminComment: 'Request denied - insufficient leave balance' } : req
    ));
    toast.error('Leave request rejected');
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const approvedCount = requests.filter(req => req.status === 'approved').length;
  const rejectedCount = requests.filter(req => req.status === 'rejected').length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="table" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatedContainer>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20"
            >
              <ClipboardCheck className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Leave Approvals</h1>
              <p className="text-muted-foreground">
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field py-2 w-40"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', count: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Approved', count: approvedCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
            { label: 'Rejected', count: rejectedCount, icon: XCircle, color: 'from-red-500 to-pink-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LeaveRequestList
            requests={filteredRequests}
            showActions
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </motion.div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
