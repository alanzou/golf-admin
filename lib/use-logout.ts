'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface UseLogoutOptions {
  type: 'admin' | 'golf-course';
  redirectTo?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: Error) => void;
}

export function useLogout({
  type,
  redirectTo,
  onLogoutStart,
  onLogoutComplete,
  onLogoutError
}: UseLogoutOptions) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const adminAuth = useAuth();
  const golfCourseAuth = useGolfCourseAuth();
  
  const auth = type === 'admin' ? adminAuth : golfCourseAuth;

  const performLogout = async () => {
    setIsLoggingOut(true);
    onLogoutStart?.();

    try {
      if (type === 'admin') {
        await adminAuth.logout();
      } else {
        await golfCourseAuth.logout(false, redirectTo);
      }
      
      onLogoutComplete?.();
    } catch (error) {
      console.error('Logout error:', error);
      onLogoutError?.(error instanceof Error ? error : new Error('Logout failed'));
    } finally {
      setIsLoggingOut(false);
      setShowConfirmDialog(false);
    }
  };

  const initiateLogout = () => {
    setShowConfirmDialog(true);
  };

  const cancelLogout = () => {
    setShowConfirmDialog(false);
  };

  return {
    user: auth.user,
    isLoggingOut,
    showConfirmDialog,
    initiateLogout,
    cancelLogout,
    performLogout
  };
}

// Convenience hooks for specific auth types
export function useAdminLogout(options?: Omit<UseLogoutOptions, 'type'>) {
  return useLogout({ ...options, type: 'admin' });
}

export function useGolfCourseLogout(options?: Omit<UseLogoutOptions, 'type'>) {
  return useLogout({ ...options, type: 'golf-course' });
} 