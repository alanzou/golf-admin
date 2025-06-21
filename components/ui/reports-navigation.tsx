'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, FileText, ClipboardList, ArrowLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutDialog } from '@/components/ui/logout-dialog';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface ReportsNavigationProps {
  golfCourseName?: string;
}

export function ReportsNavigation({ golfCourseName }: ReportsNavigationProps) {
  const pathname = usePathname();
  const { user, logout } = useGolfCourseAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await logout(false, '/login');
  };

  const navigationItems = [
    {
      href: '/bookings',
      label: 'Bookings',
      icon: Calendar,
      description: 'View tee time reservations'
    },
    {
      href: '/checkin-report',
      label: 'Check-in Report',
      icon: FileText,
      description: 'Order transaction history'
    },
    {
      href: '/tee-time-sheet',
      label: 'Tee Time Sheet',
      icon: ClipboardList,
      description: 'Slot management & check-ins'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Back to dashboard */}
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {golfCourseName && (
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">{golfCourseName}</h2>
                <p className="text-sm text-gray-500">Reports & Management</p>
              </div>
            )}
          </div>

          {/* Center - Navigation items */}
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-gray-100 hover:text-gray-900",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600"
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile-friendly navigation description */}
        <div className="md:hidden pb-2">
          {golfCourseName && (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">{golfCourseName}</h2>
              <p className="text-sm text-gray-500">Reports & Management</p>
            </div>
          )}
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title={golfCourseName ? `Logout from ${golfCourseName}` : "Confirm Logout"}
        description="Are you sure you want to log out? You will need to sign in again to access the reports."
        userName={user ? `${user.firstName} ${user.lastName} (@${user.username})` : undefined}
      />
    </div>
  );
} 