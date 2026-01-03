import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Camera, Building2, BadgeIndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedContainer, AnimatedCard } from '@/components/ui/animated-container';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useSkeletonLoading } from '@/hooks/useSkeletonLoading';
import { formatIndianDate, formatINR, formatIndianPhone } from '@/utils/formatters';
import { userAPI } from '@/services/api';

export default function Profile() {
  const { user } = useAuth();
  const isLoading = useSkeletonLoading(1500);
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setPhone(data.user.phone || '+91 98765 43210');
        setAddress(data.user.address || 'Sector 18, Gurugram, Haryana 122015');
        if (data.user.profile_picture) {
          setProfileImage(data.user.profile_picture);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [isLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateProfile({
        phone,
        address,
        profilePicture: profileImage || undefined
      });
      toast.success('Profile updated successfully! प्रोफ़ाइल अपडेट हो गई');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton type="profile" />
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
            <User className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <AnimatedCard delay={0.1} className="stat-card text-center">
            <div className="relative inline-block mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto overflow-hidden ring-4 ring-primary/10"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold gradient-text">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                )}
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white flex items-center justify-center shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            </div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-muted-foreground">{user?.position}</p>
            <p className="text-sm text-primary mt-1 font-medium">{user?.department}</p>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Joined {formatIndianDate(user?.joiningDate || '2023-04-15')}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-primary">3.5</p>
                <p className="text-xs text-muted-foreground">Years Exp</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">96%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
            </div>
          </AnimatedCard>

          {/* Personal Details */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedContainer delay={0.2} className="stat-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Personal Information
                </h3>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={isEditing ? 'btn-gradient' : ''}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Briefcase className="w-4 h-4" /> Employee ID
                    </label>
                    <p className="font-medium">{user?.employeeId}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <p className="font-medium">{user?.email}</p>
                  </motion.div>
                </div>

                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="w-4 h-4" /> Phone
                    </label>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.input
                          key="input"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-field py-2"
                          placeholder="+91 98765 43210"
                        />
                      ) : (
                        <motion.p
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-medium"
                        >
                          {phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" /> Address
                    </label>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.input
                          key="input"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="input-field py-2"
                          placeholder="Enter your address"
                        />
                      ) : (
                        <motion.p
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-medium"
                        >
                          {address}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-muted/30 rounded-xl"
                  >
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <BadgeIndianRupee className="w-4 h-4" /> PAN Number
                    </label>
                    <p className="font-medium">XXXXX1234X</p>
                  </motion.div>
                </div>
              </div>
            </AnimatedContainer>

            {/* Job Details */}
            <AnimatedContainer delay={0.3} className="stat-card">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Job Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Building2, label: 'Department', value: user?.department },
                  { icon: Briefcase, label: 'Position', value: user?.position },
                  { icon: Calendar, label: 'Joining Date', value: formatIndianDate(user?.joiningDate || '2023-04-15') },
                  { icon: User, label: 'Role', value: user?.role, capitalize: true },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className={`font-medium ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </AnimatedContainer>
    </DashboardLayout>
  );
}
