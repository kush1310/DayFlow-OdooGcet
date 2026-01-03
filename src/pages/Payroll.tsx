import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DollarSign, TrendingUp, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Payroll() {
  const { user } = useAuth();

  const payslips = [
    { month: 'December 2025', gross: 8333, net: 6625, status: 'Paid' },
    { month: 'November 2025', gross: 8333, net: 6625, status: 'Paid' },
    { month: 'October 2025', gross: 8333, net: 6625, status: 'Paid' },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="page-header">Payroll</h1>

        {/* Salary Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Basic Salary</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">${user?.salary.basic.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Allowances</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">+${user?.salary.allowances.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Deductions</span>
              <TrendingUp className="w-5 h-5 text-destructive rotate-180" />
            </div>
            <p className="text-2xl font-bold text-destructive">-${user?.salary.deductions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>
          <div className="stat-card bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-primary font-medium">Net Salary</span>
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">${user?.salary.netSalary.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>
        </div>

        {/* Pay Structure Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="stat-card">
            <h3 className="font-semibold mb-6">Salary Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Base Pay', amount: user?.salary.basic || 0, percent: 70 },
                { label: 'Housing Allowance', amount: (user?.salary.allowances || 0) * 0.5, percent: 8 },
                { label: 'Transport Allowance', amount: (user?.salary.allowances || 0) * 0.3, percent: 5 },
                { label: 'Other Benefits', amount: (user?.salary.allowances || 0) * 0.2, percent: 3 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-6">Deductions</h3>
            <div className="space-y-4">
              {[
                { label: 'Income Tax', amount: (user?.salary.deductions || 0) * 0.6 },
                { label: 'Social Security', amount: (user?.salary.deductions || 0) * 0.25 },
                { label: 'Health Insurance', amount: (user?.salary.deductions || 0) * 0.15 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium text-destructive">-${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payslip History */}
        <div className="stat-card">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Payslip History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4 text-left">Month</th>
                  <th className="px-6 py-4 text-left">Gross Pay</th>
                  <th className="px-6 py-4 text-left">Net Pay</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslips.map((slip, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{slip.month}</td>
                    <td className="px-6 py-4 text-sm">${slip.gross.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">${slip.net.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="status-badge status-approved">{slip.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
