import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceRecord } from '@/types/hrms';
import { Clock, CheckCircle, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { attendanceAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Attendance() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const [recordsData, summaryData] = await Promise.all([
          attendanceAPI.getMyRecords({ limit: 30 }),
          attendanceAPI.getSummary()
        ]);
        setRecords(recordsData.records || []);
        setSummary(summaryData.summary);

        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = Array.isArray(recordsData.records)
          ? recordsData.records.find((r: any) => r.date && r.date.startsWith(today))
          : undefined;
        setHasCheckedIn(!!todayRecord?.checkIn);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchAttendance();
    }
  }, [isLoading]);

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully! 🎯');
      setHasCheckedIn(true);

      // Refresh records
      const recordsData = await attendanceAPI.getMyRecords({ limit: 30 });
      setRecords(recordsData.records || []);
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Check-in failed. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully! See you tomorrow! 👋');

      // Refresh records
      const [recordsData, summaryData] = await Promise.all([
        attendanceAPI.getMyRecords({ limit: 30 }),
        attendanceAPI.getSummary()
      ]);
      setRecords(recordsData.records || []);
      setSummary(summaryData.summary);
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error('Check-out failed. Please try again.');
    }
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
            className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50"
          >
            <Clock className="h-6 w-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Attendance Tracking
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Mark your presence and view history</p>
          </motion.div>
        </div>

        {/* Check In/Out Card */}
        <AnimatedCard delay={0.1} className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Today's Attendance
            </h2>
            <div className="flex gap-4">
              <Button
                onClick={handleCheckIn}
                disabled={hasCheckedIn}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {hasCheckedIn ? 'Checked In ✓' : 'Check In'}
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!hasCheckedIn}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg disabled:opacity-50"
              >
                <Clock className="h-5 w-5 mr-2" />
                Check Out
              </Button>
            </div>
          </div>
        </AnimatedCard>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Days', value: summary.totalDays || 0, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
              { label: 'Present', value: summary.presentDays || 0, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
              { label: 'Absent', value: summary.absentDays || 0, icon: Users, color: 'from-red-500 to-pink-500' },
              { label: 'Avg Hours', value: summary.avgWorkHours?.toFixed(1) || '0.0', icon: Clock, color: 'from-purple-500 to-indigo-500' },
            ].map((stat, index) => (
              <AnimatedCard key={stat.label} delay={0.2 + index * 0.1}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Attendance Records */}
        <AnimatedCard delay={0.6}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Attendance History
            </h2>
            <div className="space-y-4">
              {records.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No attendance records found
                </p>
              ) : (
                records.map((record: any, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Check-in: {record.checkIn || 'N/A'} | Check-out: {record.checkOut || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            record.status === 'half-day' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                          {record.status}
                        </span>
                        {record.workHours && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {record.workHours}h worked
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </AnimatedCard>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
