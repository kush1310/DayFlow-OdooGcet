import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Wallet, Download, Clock, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { payrollAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Payroll() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [salary, setSalary] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const [salaryData, payslipsData] = await Promise.all([
          payrollAPI.getSalary(),
          payrollAPI.getPayslips()
        ]);
        setSalary(salaryData);
        setPayslips(payslipsData.payslips || []);
      } catch (error) {
        console.error('Failed to fetch payroll data:', error);
        toast.error('Failed to load payroll data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchPayroll();
    }
  }, [isLoading]);

  const handleDownloadPayslip = async (month: string, year: number) => {
    try {
      await payrollAPI.downloadPayslip(month, year.toString());
      toast.success('Payslip downloaded successfully! 📄');
    } catch (error) {
      console.error('Failed to download payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="form" />
      </DashboardLayout>
    );
  }

  const grossSalary = Number(salary?.basicSalary || 0) + Number(salary?.allowances || 0);
  const netSalary = grossSalary - Number(salary?.deductions || 0);

  return (
    <DashboardLayout>
      <AnimatedContainer>
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50"
          >
            <Wallet className="h-6 w-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Payroll & Salary
            </h1>
            <p className="text-gray-500 dark:text-gray-400">View your salary details and payslips</p>
          </motion.div>
        </div>

        {/* Salary Breakdown */}
        <AnimatedCard delay={0.1} className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              Current Salary Structure
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Basic Salary</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ₹{(salary?.basicSalary || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Allowances</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ₹{(salary?.allowances || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Deductions</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  ₹{(salary?.deductions || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Salary (Monthly)</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ₹{netSalary.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Payslip History */}
        <AnimatedCard delay={0.3}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Payslip History
            </h2>

            <div className="space-y-4">
              {payslips.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No payslips available yet
                </p>
              ) : (
                payslips.map((slip: any, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {slip.month} {slip.year}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Net: ₹{slip.netSalary?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownloadPayslip(slip.month, slip.year)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
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
