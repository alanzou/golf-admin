'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogOut, User, Users, Settings, Building, FileText, Calendar, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';
import { GolfCourseUserManagement } from './golf-course-user-management';
import { GolfCourseSettings } from './golf-course-settings';

interface GolfCourseAdminDashboardProps {
  golfCourseId: number;
  golfCourseName: string;
  subdomain: string;
}

function DashboardHeader({ golfCourseName, subdomain }: { golfCourseName: string; subdomain: string }) {
  const { user, logout } = useGolfCourseAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">{golfCourseName} Admin</h1>
        <p className="text-gray-600">Management Dashboard for {subdomain}</p>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Welcome, {user.firstName} {user.lastName}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
          </div>
        )}
        <Link
          href={`/`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to site
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function GolfCourseAdminDashboard({ golfCourseId, golfCourseName, subdomain }: GolfCourseAdminDashboardProps) {
  const { isAuthenticated, isLoading, checkAuth, user } = useGolfCourseAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check authentication when component mounts
    if (!isLoading && !isAuthenticated) {
      checkAuth(golfCourseId);
    }
  }, [isLoading, isAuthenticated, golfCourseId]);

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access the admin dashboard.</p>
          <Link href={`/login`}>
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canManageUsers = user && (user.role === 'MANAGER' || user.role === 'OWNER');
  const canManageSettings = user && (user.role === 'MANAGER' || user.role === 'OWNER');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardHeader golfCourseName={golfCourseName} subdomain={subdomain} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" disabled={!canManageUsers}>
              <Users className="h-4 w-4" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!canManageSettings}>
              <Settings className="h-4 w-4" />
              Course Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {canManageUsers && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('users')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Staff
                      </Button>
                    )}
                    {canManageSettings && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Course Settings
                      </Button>
                    )}
                    <Link href="/bookings" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Bookings
                      </Button>
                    </Link>
                    <Link href="/checkin-report" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Check-in Report
                      </Button>
                    </Link>
                    <Link href="/tee-time-sheet" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Tee Time Sheet
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                    <p><strong>Username:</strong> @{user?.username}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Course Info</h3>
                  <div className="space-y-2">
                    <p><strong>Course:</strong> {golfCourseName}</p>
                    <p><strong>Subdomain:</strong> {subdomain}</p>
                    <p><strong>Course ID:</strong> {golfCourseId}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!canManageUsers && !canManageSettings && (
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
                  <p className="text-gray-600">
                    You have staff-level access. Contact your manager or owner for additional permissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            {canManageUsers ? (
              <GolfCourseUserManagement 
                golfCourseId={golfCourseId} 
                golfCourseName={golfCourseName} 
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">You don't have permission to manage staff.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            {canManageSettings ? (
              <GolfCourseSettings golfCourseId={golfCourseId} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">You don't have permission to manage course settings.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 