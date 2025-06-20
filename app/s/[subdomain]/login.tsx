'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, Building2 } from 'lucide-react';
import { rootDomain } from '@/lib/utils';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    golfCourse: {
      id: number;
      name: string;
    };
  };
  error?: string;
}

interface GolfCourseLoginProps {
  subdomain: string;
  golfCourseId?: number;
  golfCourseName?: string;
}

export default function GolfCourseLogin({ 
  subdomain, 
  golfCourseId, 
  golfCourseName 
}: GolfCourseLoginProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated } = useGolfCourseAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && golfCourseId) {
      router.push('/admin');
    }
  }, [isAuthenticated, golfCourseId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!golfCourseId) {
      setError('Golf course not found. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/golf-course/${golfCourseId}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        // Use the golf course auth hook to handle login
        login(data.token, data.user);
        
        // Redirect to subdomain admin area
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Golf course login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              {golfCourseName || subdomain}
            </h1>
          </div>
          <p className="text-gray-600">Staff Login</p>
          <p className="text-sm text-gray-500 mt-1">
            {subdomain}.{rootDomain}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your staff credentials to access the golf course management system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.username || !formData.password || !golfCourseId}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact your golf course administrator
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a
            href={`/${subdomain}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to {subdomain}.{rootDomain}
          </a>
        </div>
      </div>
    </div>
  );
}
