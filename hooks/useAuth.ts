// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Set router instance in apiClient
  useEffect(() => {
    apiClient.setRouter(router);
  }, [router]);

  const checkAuth = async () => {
    setLoading(true);

    try {
      const userData = await authService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const userData = await authService.signIn(email, password);
    setUser(userData);
    setIsAuthenticated(true);
    // Use Next.js router
    router.push('/dashboard');
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    await signOut({ redirect: false });
    setUser(null);
    setIsAuthenticated(false);
    // Use Next.js router
    router.push('/login');
    router.refresh();
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}