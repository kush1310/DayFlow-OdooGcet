import { ReactNode, useState } from 'react';
import { Sidebar, MobileNav } from './Sidebar';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="min-h-screen pt-16 lg:pt-0 hidden lg:block"
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </motion.main>

      {/* Mobile Main Content */}
      <main className="lg:hidden min-h-screen pt-20">
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
