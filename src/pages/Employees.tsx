import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, UserPlus, Search, Building2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { employeeAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Employees() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [dataLoading, setDataLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phone: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 50000,
    allowances: 10000,
    deductions: 5000
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, depsData, positionsData] = await Promise.all([
          employeeAPI.getAll({ department: department === 'all' ? undefined : department, search }),
          employeeAPI.getDepartments(),
          employeeAPI.getPositions()
        ]);
        setEmployees(employeesData.users || employeesData.employees || []);
        setDepartments(depsData.departments || []);
        setPositions(positionsData.positions || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchData();
    }
  }, [isLoading, department, search]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await employeeAPI.addEmployee(newEmployee);
      toast.success('Employee added successfully! Welcome email sent 📧');

      // Reset form
      setNewEmployee({
        employeeId: '',
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        position: '',
        phone: '',
        joiningDate: new Date().toISOString().split('T')[0],
        basicSalary: 50000,
        allowances: 10000,
        deductions: 5000
      });
      setIsAddDialogOpen(false);

      // Refresh employee list
      const employeesData = await employeeAPI.getAll({ department: department === 'all' ? undefined : department, search });
      setEmployees(employeesData.users || employeesData.employees || []);

    } catch (error: any) {
      console.error('Failed to add employee:', error);
      toast.error(error.message || 'Failed to add employee');
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50"
            >
              <Users className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your team members</p>
            </motion.div>
          </div>

          {user?.role === 'admin' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee ID *</Label>
                      <Input
                        required
                        value={newEmployee.employeeId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                        placeholder="EMP001"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        required
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder="employee@company.com"
                      />
                    </div>
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        required
                        value={newEmployee.firstName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        required
                        value={newEmployee.lastName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept: any) => (
                            <SelectItem key={typeof dept === 'string' ? dept : dept.name} value={typeof dept === 'string' ? dept : dept.name}>
                              {typeof dept === 'string' ? dept : dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Position</Label>
                      <div className="relative">
                        <Input
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                          placeholder="Select or type position"
                          list="positions-list"
                        />
                        <datalist id="positions-list">
                          {positions.map((pos) => (
                            <option key={pos} value={pos} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        placeholder="+91 99999 99999"
                      />
                    </div>
                    <div>
                      <Label>Joining Date</Label>
                      <Input
                        type="date"
                        value={newEmployee.joiningDate}
                        onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Basic Salary (₹)</Label>
                      <Input
                        type="number"
                        value={newEmployee.basicSalary}
                        onChange={(e) => setNewEmployee({ ...newEmployee, basicSalary: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Allowances (₹)</Label>
                      <Input
                        type="number"
                        value={newEmployee.allowances}
                        onChange={(e) => setNewEmployee({ ...newEmployee, allowances: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Deductions (₹)</Label>
                      <Input
                        type="number"
                        value={newEmployee.deductions}
                        onChange={(e) => setNewEmployee({ ...newEmployee, deductions: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                      Add Employee & Send Email
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter */}
        <AnimatedCard delay={0.1} className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={typeof dept === 'string' ? dept : dept.name} value={typeof dept === 'string' ? dept : dept.name}>
                      {typeof dept === 'string' ? dept : dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AnimatedCard>

        {/* Employee List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No employees found</p>
            </div>
          ) : (
            employees.map((employee: any, index) => (
              <AnimatedCard key={employee.id} delay={0.2 + index * 0.05}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{employee.position || 'Employee'}</p>
                      <p className="text-xs text-gray-400">{employee.employeeId}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Building2 className="h-4 w-4" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate" title={employee.email}>{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                      {employee.role}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
