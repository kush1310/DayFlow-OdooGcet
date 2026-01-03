import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeaveRequestForm } from '@/components/leave/LeaveRequestForm';
import { LeaveRequestList } from '@/components/leave/LeaveRequestList';
import { LeaveRequest, LeaveType } from '@/types/hrms';
import { Calendar, Clock } from 'lucide-react';

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Michael Chen',
    leaveType: 'paid',
    startDate: '2026-01-15',
    endDate: '2026-01-17',
    reason: 'Family vacation planned for the new year',
    status: 'approved',
    appliedOn: '2026-01-02',
    adminComment: 'Approved. Enjoy your vacation!',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Michael Chen',
    leaveType: 'sick',
    startDate: '2025-12-20',
    endDate: '2025-12-21',
    reason: 'Not feeling well, need rest',
    status: 'approved',
    appliedOn: '2025-12-19',
  },
];

export default function Leave() {
  const { user } = useAuth();
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

  const leaveBalance = {
    paid: 12,
    sick: 8,
    unpaid: 5,
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="page-header">Leave Management</h1>

        {/* Leave Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(leaveBalance).map(([type, balance]) => (
            <div key={type} className="stat-card flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground capitalize">{type} Leave</p>
                <p className="text-2xl font-bold">{balance} days</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <LeaveRequestForm onSubmit={handleSubmit} />
          </div>
          <div className="lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              My Leave Requests
            </h3>
            <LeaveRequestList requests={leaveRequests} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
