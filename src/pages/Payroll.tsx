import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IndianRupee, TrendingUp, FileText, Download, Building2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { formatINR } from '@/utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function Payroll() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);

  // Convert salary to monthly (divide by 12)
  const monthlySalary = {
    basic: Math.round((user?.salary.basic || 0) / 12),
    allowances: Math.round((user?.salary.allowances || 0) / 12),
    deductions: Math.round((user?.salary.deductions || 0) / 12),
    netSalary: Math.round((user?.salary.netSalary || 0) / 12),
  };

  const payslips = [
    { month: 'December 2025', gross: monthlySalary.basic + monthlySalary.allowances, net: monthlySalary.netSalary, status: 'Paid', date: '31-12-2025' },
    { month: 'November 2025', gross: monthlySalary.basic + monthlySalary.allowances, net: monthlySalary.netSalary, status: 'Paid', date: '30-11-2025' },
    { month: 'October 2025', gross: monthlySalary.basic + monthlySalary.allowances, net: monthlySalary.netSalary, status: 'Paid', date: '31-10-2025' },
  ];

  const downloadPayslip = (slip: typeof payslips[0]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DAYFLOW HR SUITE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Payslip for ' + slip.month, 105, 32, { align: 'center' });
    
    // Employee Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', 14, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.firstName} ${user?.lastName}`, 14, 70);
    doc.text(`Employee ID: ${user?.employeeId}`, 14, 77);
    doc.text(`Department: ${user?.department}`, 14, 84);
    doc.text(`Designation: ${user?.position}`, 14, 91);
    
    doc.text(`Pay Period: ${slip.month}`, 120, 70);
    doc.text(`Pay Date: ${slip.date}`, 120, 77);
    doc.text(`PAN: XXXXX1234X`, 120, 84);
    doc.text(`Bank A/C: XXXX XXXX 1234`, 120, 91);
    
    // Earnings Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Earnings', 14, 110);
    
    autoTable(doc, {
      startY: 115,
      head: [['Component', 'Amount (₹)']],
      body: [
        ['Basic Salary', formatINR(monthlySalary.basic)],
        ['House Rent Allowance (HRA)', formatINR(Math.round(monthlySalary.allowances * 0.5))],
        ['Conveyance Allowance', formatINR(Math.round(monthlySalary.allowances * 0.3))],
        ['Special Allowance', formatINR(Math.round(monthlySalary.allowances * 0.2))],
        ['Gross Earnings', formatINR(slip.gross)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135] },
      margin: { left: 14, right: 105 },
      tableWidth: 85,
    });
    
    // Deductions Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Deductions', 110, 110);
    
    autoTable(doc, {
      startY: 115,
      head: [['Component', 'Amount (₹)']],
      body: [
        ['Provident Fund (PF)', formatINR(Math.round(monthlySalary.deductions * 0.4))],
        ['Professional Tax', formatINR(200)],
        ['Income Tax (TDS)', formatINR(Math.round(monthlySalary.deductions * 0.5))],
        ['ESI', formatINR(Math.round(monthlySalary.deductions * 0.1))],
        ['Total Deductions', formatINR(monthlySalary.deductions)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] },
      margin: { left: 110, right: 14 },
      tableWidth: 85,
    });
    
    // Net Salary
    const finalY = 180;
    doc.setFillColor(236, 253, 245);
    doc.rect(14, finalY, 182, 25, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.rect(14, finalY, 182, 25, 'S');
    
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Salary Payable', 20, finalY + 10);
    doc.setFontSize(18);
    doc.text(formatINR(slip.net), 20, finalY + 20);
    
    // Amount in words
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`(Amount in words: ${numberToWords(slip.net)} Rupees Only)`, 14, finalY + 35);
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is a computer generated payslip and does not require signature.', 105, 280, { align: 'center' });
    doc.text('DayFlow HR Suite | Made in India 🇮🇳', 105, 287, { align: 'center' });
    
    doc.save(`Payslip_${slip.month.replace(' ', '_')}_${user?.employeeId}.pdf`);
    toast.success('Payslip downloaded successfully!');
  };

  // Helper function to convert number to words
  function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="dashboard" />
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
            className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20"
          >
            <Wallet className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">View your salary details and download payslips</p>
          </div>
        </div>

        {/* Salary Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { title: 'Basic Salary', amount: monthlySalary.basic, icon: Building2, color: 'primary', suffix: '/month' },
            { title: 'Allowances', amount: monthlySalary.allowances, icon: TrendingUp, color: 'success', prefix: '+', suffix: '/month' },
            { title: 'Deductions', amount: monthlySalary.deductions, icon: TrendingUp, color: 'destructive', prefix: '-', suffix: '/month', rotate: true },
            { title: 'Net Salary', amount: monthlySalary.netSalary, icon: IndianRupee, color: 'primary', suffix: '/month', highlight: true },
          ].map((item, i) => (
            <AnimatedCard key={item.title} delay={i * 0.1} className={`stat-card ${item.highlight ? 'bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${item.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{item.title}</span>
                <div className={`p-2 rounded-xl ${item.highlight ? 'bg-gradient-to-br from-primary to-purple-500' : `bg-${item.color}/10`}`}>
                  <item.icon className={`w-5 h-5 ${item.highlight ? 'text-white' : `text-${item.color}`} ${item.rotate ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <p className={`text-2xl lg:text-3xl font-bold ${
                item.color === 'success' ? 'text-emerald-600' : 
                item.color === 'destructive' ? 'text-red-500' : 
                item.highlight ? 'gradient-text' : ''
              }`}>
                {item.prefix}{formatINR(item.amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.suffix}</p>
            </AnimatedCard>
          ))}
        </div>

        {/* Pay Structure Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatedContainer delay={0.2} className="stat-card">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Salary Breakdown
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Basic Pay', amount: monthlySalary.basic, percent: 60, color: 'bg-primary' },
                { label: 'House Rent Allowance (HRA)', amount: Math.round(monthlySalary.allowances * 0.5), percent: 20, color: 'bg-emerald-500' },
                { label: 'Conveyance Allowance', amount: Math.round(monthlySalary.allowances * 0.3), percent: 12, color: 'bg-blue-500' },
                { label: 'Special Allowance', amount: Math.round(monthlySalary.allowances * 0.2), percent: 8, color: 'bg-purple-500' },
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-semibold">{formatINR(item.amount)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.3} className="stat-card">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Deductions
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Provident Fund (PF)', amount: Math.round(monthlySalary.deductions * 0.4), desc: '12% of Basic' },
                { label: 'Professional Tax', amount: 200, desc: 'State Tax' },
                { label: 'Income Tax (TDS)', amount: Math.round(monthlySalary.deductions * 0.5), desc: 'As per IT Slab' },
                { label: 'ESI', amount: Math.round(monthlySalary.deductions * 0.1), desc: '0.75% of Gross' },
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20"
                >
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">-{formatINR(item.amount)}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>
        </div>

        {/* Payslip History */}
        <AnimatedContainer delay={0.4} className="stat-card">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Payslip History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 lg:px-6 py-4 text-left rounded-tl-xl">Month</th>
                  <th className="px-4 lg:px-6 py-4 text-left">Gross Pay</th>
                  <th className="px-4 lg:px-6 py-4 text-left">Net Pay</th>
                  <th className="px-4 lg:px-6 py-4 text-left">Status</th>
                  <th className="px-4 lg:px-6 py-4 text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslips.map((slip, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="bg-card hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium">{slip.month}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm">{formatINR(slip.gross)}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-primary">{formatINR(slip.net)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="status-badge status-approved">{slip.status}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 hover:bg-primary hover:text-white"
                          onClick={() => downloadPayslip(slip)}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedContainer>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
