'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoutDialog } from '@/components/ui/logout-dialog';
import { Trash2, Loader2, LogOut, User, Users, MapPin, Building, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { deleteSubdomainAction } from '@/app/actions';
import { rootDomain, protocol } from '@/lib/utils';
import { useAuth } from '@/lib/use-auth';
import { UserManagement } from './components/user-management';
import { GolfCourseManagement } from './components/golf-course-management';
import { GolfCourseUserManagement } from './components/golf-course-user-management';
import { DeviceManagement } from './components/device-management';

type Tenant = {
  subdomain: string;
  emoji: string;
  createdAt: number;
};

type DeleteState = {
  error?: string;
  success?: string;
};

function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subdomain Management</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Welcome, {user.name}</span>
            </div>
          )}
          <Link
            href={`${protocol}://${rootDomain}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {rootDomain}
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Confirm Admin Logout"
        description="Are you sure you want to log out of the admin panel? You will need to sign in again to access the system."
        userName={user?.name}
      />
    </>
  );
}

function TenantGrid({
  tenants,
  action,
  isPending
}: {
  tenants: Tenant[];
  action: (formData: FormData) => void;
  isPending: boolean;
}) {
  if (tenants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No subdomains have been created yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.subdomain}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{tenant.subdomain}</CardTitle>
              <form action={action}>
                <input
                  type="hidden"
                  name="subdomain"
                  value={tenant.subdomain}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  disabled={isPending}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl">{tenant.emoji}</div>
              <div className="text-sm text-gray-500">
                Created: {new Date(tenant.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4">
              <a
                href={`${protocol}://${tenant.subdomain}.${rootDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Visit subdomain →
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboard({ tenants }: { tenants: Tenant[] }) {
  const [state, action, isPending] = useActionState<DeleteState, FormData>(
    deleteSubdomainAction,
    {}
  );
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('subdomains');

  useEffect(() => {
    // Check authentication when component mounts
    if (!isLoading && !isAuthenticated) {
      checkAuth();
    }
  }, [isLoading, isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (handled by useAuth hook)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative p-4 md:p-8">
      <DashboardHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subdomains" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Subdomains
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            System Users
          </TabsTrigger>
          <TabsTrigger value="golf-courses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Golf Courses
          </TabsTrigger>
          <TabsTrigger value="golf-course-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Golf Course Users
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subdomains" className="space-y-6">
          <TenantGrid tenants={tenants} action={action} isPending={isPending} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="golf-courses" className="space-y-6">
          <GolfCourseManagement />
        </TabsContent>
        
        <TabsContent value="golf-course-users" className="space-y-6">
          <GolfCourseUserManagement />
        </TabsContent>
        
        <TabsContent value="devices" className="space-y-6">
          <DeviceManagement />
        </TabsContent>
      </Tabs>

      {state.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md">
          {state.success}
        </div>
      )}
    </div>
  );
}
