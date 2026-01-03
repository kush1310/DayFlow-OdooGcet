import { LeaveRequest } from '@/types/hrms';
import { cn } from '@/lib/utils';

interface LeaveRequestListProps {
  requests: LeaveRequest[];
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const leaveTypeLabels = {
  paid: 'Paid Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
};

export function LeaveRequestList({ requests, showActions, onApprove, onReject }: LeaveRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="stat-card text-center py-8">
        <p className="text-muted-foreground">No leave requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{leaveTypeLabels[request.leaveType]}</h4>
              {showActions && (
                <p className="text-sm text-muted-foreground">{request.userName}</p>
              )}
            </div>
            <span className={cn(
              'status-badge',
              request.status === 'pending' && 'status-pending',
              request.status === 'approved' && 'status-approved',
              request.status === 'rejected' && 'status-rejected',
            )}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">From</p>
              <p className="font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">To</p>
              <p className="font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{request.reason}</p>

          {showActions && request.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove?.(request.id)}
                className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject?.(request.id)}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Reject
              </button>
            </div>
          )}

          {request.adminComment && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Admin Comment</p>
              <p className="text-sm">{request.adminComment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
