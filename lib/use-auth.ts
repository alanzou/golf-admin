'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });
  const router = useRouter();

  useEffect(() => {
    // Check for stored authentication data on mount
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

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
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true
    });
  };

  const logout = useCallback(async (skipServerCall = false) => {
    const token = authState.token || localStorage.getItem('auth_token');
    
    // Call server-side logout endpoint if token exists and not skipping
    if (token && !skipServerCall) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Server-side logout error:', error);
        // Continue with client-side logout even if server call fails
      }
    }

    // Clear client-side data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Redirect to login
    router.push('/admin/login');
  }, [router, authState.token]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = authState.token || localStorage.getItem('auth_token');
    
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Update user data if needed
          setAuthState(prev => ({
            ...prev,
            user: data.user,
            isAuthenticated: true
          }));
          return true;
        }
      }
      
      // Token is invalid, logout
      logout();
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return false;
    }
  }, [authState.token, logout]);

  const getToken = (): string | null => {
    return authState.token || localStorage.getItem('auth_token');
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    getToken
  };
} 