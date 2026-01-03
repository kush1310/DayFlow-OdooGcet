import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest } from '@/types/hrms';
import { toast } from 'sonner';
import { ClipboardCheck, Filter } from 'lucide-react';

const initialRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Michael Chen',
    leaveType: 'paid',
    startDate: '2026-01-15',
    endDate: '2026-01-17',
    reason: 'Family vacation planned for the new year',
    status: 'pending',
    appliedOn: '2026-01-02',
  },
  {
    id: '2',
    userId: '3',
    userName: 'Emma Wilson',
    leaveType: 'sick',
    startDate: '2026-01-10',
    endDate: '2026-01-10',
    reason: 'Doctor appointment',
    status: 'pending',
    appliedOn: '2026-01-08',
  },
  {
    id: '3',
    userId: '4',
    userName: 'James Brown',
    leaveType: 'unpaid',
    startDate: '2026-01-20',
    endDate: '2026-01-25',
    reason: 'Personal matter - extended family event',
    status: 'pending',
    appliedOn: '2026-01-01',
  },
  {
    id: '4',
    userId: '5',
    userName: 'Lisa Anderson',
    leaveType: 'paid',
    startDate: '2025-12-28',
    endDate: '2025-12-30',
    reason: 'Holiday travel',
    status: 'approved',
    appliedOn: '2025-12-15',
    adminComment: 'Approved for holiday period',
  },
];

export default function LeaveApprovals() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'approved', adminComment: 'Approved by HR' } : req
    ));
    toast.success('Leave request approved');
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-header mb-0">Leave Approvals</h1>
            <p className="text-muted-foreground">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting your review
            </p>
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

        <LeaveRequestList
          requests={filteredRequests}
          showActions
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
}
