'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface GolfCourseUser {
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
}

interface GolfCourseAuthState {
  user: GolfCourseUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useGolfCourseAuth() {
  const [authState, setAuthState] = useState<GolfCourseAuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });
  const router = useRouter();

  useEffect(() => {
    // Check for stored golf course authentication data on mount
    const token = localStorage.getItem('golf_course_auth_token');
    const userData = localStorage.getItem('golf_course_user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (error) {
        console.error('Error parsing golf course user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);

  const login = (token: string, user: GolfCourseUser) => {
    localStorage.setItem('golf_course_auth_token', token);
    localStorage.setItem('golf_course_user_data', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true
    });
  };

  const logout = useCallback(async (skipServerCall = false, redirectTo?: string) => {
    const token = authState.token || localStorage.getItem('golf_course_auth_token');
    const userData = localStorage.getItem('golf_course_user_data');
    
    // Get golf course ID for server call
    let golfCourseId: number | null = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        golfCourseId = user.golfCourse?.id;
      } catch (error) {
        console.error('Error parsing user data during logout:', error);
      }
    }
    
    // Call server-side logout endpoint if token exists and not skipping
    if (token && golfCourseId && !skipServerCall) {
      try {
        await fetch(`/api/golf-course/${golfCourseId}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Server-side golf course logout error:', error);
        // Continue with client-side logout even if server call fails
      }
    }

    // Clear client-side data
    localStorage.removeItem('golf_course_auth_token');
    localStorage.removeItem('golf_course_user_data');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Handle redirection if specified
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [router, authState.token]);

  const checkAuth = useCallback(async (golfCourseId: number): Promise<boolean> => {
    const token = authState.token || localStorage.getItem('golf_course_auth_token');
    
    if (!token) {
      return false;
    }

    try {
      // Use the golf course-specific profile endpoint if you create one
      // For now, we'll just validate the token format and check if user's golf course matches
      const userData = localStorage.getItem('golf_course_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.golfCourse.id === golfCourseId) {
          setAuthState(prev => ({
            ...prev,
            user,
            token,
            isAuthenticated: true
          }));
          return true;
        }
      }
      
      // Token is invalid or for wrong golf course, logout
      logout();
      return false;
    } catch (error) {
      console.error('Golf course auth check failed:', error);
      logout();
      return false;
    }
  }, [authState.token, logout]);

  const hasRole = (requiredRole: string): boolean => {
    if (!authState.user) return false;
    
    // Define role hierarchy using the new enum values
    const roleHierarchy: { [key: string]: number } = {
      'STAFF': 1,
      'MANAGER': 2,
      'OWNER': 3
    };

    const userRoleLevel = roleHierarchy[authState.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  const isGolfCourseUser = (golfCourseId: number): boolean => {
    return authState.user?.golfCourse.id === golfCourseId;
  };

  const getToken = (): string | null => {
    return authState.token || localStorage.getItem('golf_course_auth_token');
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    hasRole,
    isGolfCourseUser,
    getToken
  };
} 