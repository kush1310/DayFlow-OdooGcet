import { AttendanceRecord } from '@/types/hrms';
import { cn } from '@/lib/utils';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const statusLabels = {
  'present': 'Present',
  'absent': 'Absent',
  'half-day': 'Half Day',
  'leave': 'On Leave',
};

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="px-6 py-4 text-left">Date</th>
            <th className="px-6 py-4 text-left">Check In</th>
            <th className="px-6 py-4 text-left">Check Out</th>
            <th className="px-6 py-4 text-left">Work Hours</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => (
            <tr key={record.id} className="bg-card hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium">
                {new Date(record.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {record.checkIn || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {record.checkOut || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {record.workHours ? `${record.workHours}h` : '-'}
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  'status-badge',
                  record.status === 'present' && 'status-present',
                  record.status === 'absent' && 'status-absent',
                  record.status === 'half-day' && 'status-halfday',
                  record.status === 'leave' && 'status-leave',
                )}>
                  {statusLabels[record.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
