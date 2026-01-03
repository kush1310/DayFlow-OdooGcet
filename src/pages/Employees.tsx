import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User } from '@/types/hrms';
import { Search, Plus, MoreVertical, Mail, Phone } from 'lucide-react';

const mockEmployees: Partial<User>[] = [
  { id: '1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@dayflow.com', department: 'Human Resources', position: 'HR Manager', phone: '+1 (555) 123-4567' },
  { id: '2', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@dayflow.com', department: 'Engineering', position: 'Senior Developer', phone: '+1 (555) 987-6543' },
  { id: '3', firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@dayflow.com', department: 'Design', position: 'UI/UX Designer', phone: '+1 (555) 456-7890' },
  { id: '4', firstName: 'James', lastName: 'Brown', email: 'james.brown@dayflow.com', department: 'Marketing', position: 'Marketing Lead', phone: '+1 (555) 321-0987' },
  { id: '5', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@dayflow.com', department: 'Sales', position: 'Sales Manager', phone: '+1 (555) 654-3210' },
  { id: '6', firstName: 'David', lastName: 'Kim', email: 'david.kim@dayflow.com', department: 'Engineering', position: 'Backend Developer', phone: '+1 (555) 789-0123' },
];

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', ...new Set(mockEmployees.map(e => e.department))];
  
  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-header mb-0">Employees</h1>
            <p className="text-muted-foreground">{mockEmployees.length} total employees</p>
          </div>
          <button className="btn-gradient px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
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
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="stat-card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-muted rounded">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {employee.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
