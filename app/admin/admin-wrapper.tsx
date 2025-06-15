'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import { AdminDashboard } from './dashboard';
import { Loader2 } from 'lucide-react';

type Tenant = {
  subdomain: string;
  emoji: string;
  createdAt: number;
};

interface AdminWrapperProps {
  tenants: Tenant[];
}

export function AdminWrapper({ tenants }: AdminWrapperProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading) {
        const isValid = await checkAuth();
        if (!isValid) {
          router.push('/admin/login');
        }
      }
    };

    verifyAuth();
  }, [isLoading, checkAuth, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard tenants={tenants} />
    </div>
  );
} 