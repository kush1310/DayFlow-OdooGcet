import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User } from '@/types/hrms';
import { Search, Plus, MoreVertical, Mail, Phone, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { formatIndianPhone } from '@/utils/formatters';

const mockEmployees: Partial<User>[] = [
  { id: '1', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@dayflow.com', department: 'Human Resources', position: 'HR Manager', phone: '+91 98765 43210' },
  { id: '2', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@dayflow.com', department: 'Engineering', position: 'Senior Developer', phone: '+91 87654 32109' },
  { id: '3', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@dayflow.com', department: 'Design', position: 'UI/UX Designer', phone: '+91 76543 21098' },
  { id: '4', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@dayflow.com', department: 'Marketing', position: 'Marketing Lead', phone: '+91 65432 10987' },
  { id: '5', firstName: 'Kavya', lastName: 'Reddy', email: 'kavya.reddy@dayflow.com', department: 'Sales', position: 'Sales Manager', phone: '+91 54321 09876' },
  { id: '6', firstName: 'Arjun', lastName: 'Singh', email: 'arjun.singh@dayflow.com', department: 'Engineering', position: 'Backend Developer', phone: '+91 43210 98765' },
];

export default function Employees() {
  const isLoading = useSkeletonLoading(1500);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', ...new Set(mockEmployees.map(e => e.department))];
  
  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="cards" />
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
              <Users className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Employees</h1>
              <p className="text-muted-foreground">{mockEmployees.length} total employees</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-gradient px-5 py-3 rounded-xl flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </motion.button>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
              placeholder="Search by name or email..."
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="input-field w-full md:w-48"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredEmployees.map((employee, i) => (
            <AnimatedCard key={employee.id} delay={i * 0.05} className="stat-card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
                  >
                    <span className="text-lg font-bold gradient-text">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </span>
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary text-xs font-semibold rounded-full">
                  {employee.department}
                </span>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
