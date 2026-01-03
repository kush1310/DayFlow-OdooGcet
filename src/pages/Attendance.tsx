import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { CheckInOut } from '@/components/attendance/CheckInOut';
import { AttendanceRecord } from '@/types/hrms';
import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Mock attendance data
const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'half-day', 'present', 'absent', 'leave'];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    records.push({
      id: `att-${i}`,
      userId: '2',
      date: date.toISOString().split('T')[0],
      checkIn: status === 'present' || status === 'half-day' ? '09:00 AM' : undefined,
      checkOut: status === 'present' ? '06:00 PM' : status === 'half-day' ? '01:00 PM' : undefined,
      status,
      workHours: status === 'present' ? 8 : status === 'half-day' ? 4 : undefined,
    });
  }
  
  return records;
};

const mockRecords = generateAttendanceData();

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-header mb-0">Attendance</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'daily' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-6">
            <CheckInOut />
          </div>
        )}

        {isAdmin && (
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder="Search employees..."
              />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
              <button className="p-1 hover:bg-muted rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">January 2026</span>
              </div>
              <button className="p-1 hover:bg-muted rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="stat-card p-0 overflow-hidden">
          <AttendanceTable records={mockRecords} />
        </div>
      </div>
    </DashboardLayout>
  );
}
