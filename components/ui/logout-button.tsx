'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutDialog } from '@/components/ui/logout-dialog';
import { useLogout, useAdminLogout, useGolfCourseLogout } from '@/lib/use-logout';

interface LogoutButtonProps {
  type: 'admin' | 'golf-course';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
  redirectTo?: string;
  title?: string;
  description?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: Error) => void;
}

export function LogoutButton({
  type,
  variant = 'outline',
  size = 'sm',
  className,
  showIcon = true,
  showText = true,
  text = 'Logout',
  redirectTo,
  title,
  description,
  onLogoutStart,
  onLogoutComplete,
  onLogoutError
}: LogoutButtonProps) {
  const {
    user,
    isLoggingOut,
    showConfirmDialog,
    initiateLogout,
    cancelLogout,
    performLogout
  } = useLogout({
    type,
    redirectTo,
    onLogoutStart,
    onLogoutComplete,
    onLogoutError
  });

  const getDefaultTitle = () => {
    if (title) return title;
    if (type === 'admin') return 'Confirm Admin Logout';
    return 'Confirm Logout';
  };

  const getDefaultDescription = () => {
    if (description) return description;
    if (type === 'admin') {
      return 'Are you sure you want to log out of the admin panel? You will need to sign in again to access the system.';
    }
    return 'Are you sure you want to log out? You will need to sign in again to access your account.';
  };

  const getUserName = () => {
    if (!user) return undefined;
    
    if (type === 'admin') {
      return user.name;
    } else {
      // Golf course user
      const golfUser = user as any;
      return `${golfUser.firstName} ${golfUser.lastName} (@${golfUser.username})`;
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={initiateLogout}
        disabled={isLoggingOut}
        className={className}
      >
        {showIcon && <LogOut className="h-4 w-4" />}
        {showText && showIcon && <span className="ml-2">{text}</span>}
        {showText && !showIcon && text}
      </Button>

      <LogoutDialog
        isOpen={showConfirmDialog}
        onClose={cancelLogout}
        onConfirm={performLogout}
        title={getDefaultTitle()}
        description={getDefaultDescription()}
        userName={getUserName()}
      />
    </>
  );
}

// Convenience components for specific auth types
export function AdminLogoutButton(props: Omit<LogoutButtonProps, 'type'>) {
  return <LogoutButton {...props} type="admin" />;
}

export function GolfCourseLogoutButton(props: Omit<LogoutButtonProps, 'type'>) {
  return <LogoutButton {...props} type="golf-course" />;
} 