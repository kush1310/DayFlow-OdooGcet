import { useNavigate } from 'react-router-dom';
import { User, Clock, Calendar, DollarSign } from 'lucide-react';

const actions = [
  { icon: User, label: 'View Profile', path: '/profile', color: 'bg-primary' },
  { icon: Clock, label: 'Check Attendance', path: '/attendance', color: 'bg-info' },
  { icon: Calendar, label: 'Request Leave', path: '/leave', color: 'bg-warning' },
  { icon: DollarSign, label: 'View Payroll', path: '/payroll', color: 'bg-success' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.path}
          onClick={() => navigate(action.path)}
          className="stat-card card-hover text-center group"
        >
          <div className={`${action.color} w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <action.icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm font-medium">{action.label}</p>
        </button>
      ))}
    </div>
  );
}
