import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { CheckInOut } from '@/components/attendance/CheckInOut';
import { AttendanceRecord } from '@/types/hrms';
import { Calendar, ChevronLeft, ChevronRight, Search, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';

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
  const isLoading = useSkeletonLoading(1500);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

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
              <Clock className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Attendance</h1>
              <p className="text-muted-foreground">Track your daily attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'daily' 
                  ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Daily
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'weekly' 
                  ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Weekly
            </motion.button>
          </div>
        </div>

        {!isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <CheckInOut />
          </motion.div>
        )}

        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
                placeholder="Search employees..."
              />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">January 2026</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card p-0 overflow-hidden"
        >
          <AttendanceTable records={mockRecords} />
        </motion.div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
