import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="page-header">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="stat-card text-center">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-muted-foreground">{user?.position}</p>
            <p className="text-sm text-primary mt-1">{user?.department}</p>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user?.joiningDate || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Personal Information</h3>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={isEditing ? 'btn-gradient' : ''}
                >
                  {isEditing ? 'Save Changes' : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Briefcase className="w-4 h-4" /> Employee ID
                    </label>
                    <p className="font-medium">{user?.employeeId}</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="w-4 h-4" /> Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field py-2"
                        placeholder="+1 (555) 000-0000"
                      />
                    ) : (
                      <p className="font-medium">{user?.phone || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" /> Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field py-2"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="font-medium">{user?.address || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="stat-card">
              <h3 className="font-semibold mb-6">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-medium">{user?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Position</p>
                  <p className="font-medium">{user?.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Joining Date</p>
                  <p className="font-medium">{new Date(user?.joiningDate || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
