import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const activities = [
  { id: 1, type: 'check-in', message: 'Checked in at 9:00 AM', time: '2 hours ago', icon: Clock },
  { id: 2, type: 'leave-approved', message: 'Leave request approved', time: '1 day ago', icon: CheckCircle },
  { id: 3, type: 'leave-request', message: 'Applied for sick leave', time: '2 days ago', icon: Calendar },
  { id: 4, type: 'check-out', message: 'Checked out at 6:00 PM', time: '3 days ago', icon: Clock },
];

export function RecentActivity() {
  return (
    <div className="stat-card">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <activity.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
