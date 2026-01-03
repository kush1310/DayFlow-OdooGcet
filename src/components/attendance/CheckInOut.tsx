import { useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CheckInOut() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(now);
    setIsCheckedIn(true);
    toast.success(`Checked in at ${now}`);
  };

  const handleCheckOut = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(false);
    toast.success(`Checked out at ${now}`);
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Today's Attendance</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isCheckedIn ? (
          <>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Checked in at</p>
              <p className="text-2xl font-bold text-primary">{checkInTime}</p>
            </div>
            <Button
              onClick={handleCheckOut}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <LogOut className="w-5 h-5" />
              Check Out
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-medium">Not checked in yet</p>
            </div>
            <Button
              onClick={handleCheckIn}
              size="lg"
              className="gap-2 btn-gradient"
            >
              <LogIn className="w-5 h-5" />
              Check In
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
