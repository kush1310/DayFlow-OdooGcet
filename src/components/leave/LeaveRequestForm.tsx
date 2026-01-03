import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaveType } from '@/types/hrms';
import { toast } from 'sonner';

interface LeaveRequestFormProps {
  onSubmit: (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
}

export function LeaveRequestForm({ onSubmit }: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    onSubmit({ leaveType, startDate, endDate, reason });
    setStartDate('');
    setEndDate('');
    setReason('');
    toast.success('Leave request submitted successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="stat-card">
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Apply for Leave
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="input-field"
          >
            <option value="paid">Paid Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Please provide a reason for your leave request..."
          />
        </div>

        <Button type="submit" className="w-full btn-gradient">
          Submit Request
        </Button>
      </div>
    </form>
  );
}
