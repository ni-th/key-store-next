// services/auth.service.ts
import { apiClient } from '@/lib/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private user: User | null = null;
  private tokenExpiryTimer: NodeJS.Timeout | null = null;

  async signIn(email: string, password: string): Promise<User> {
    const response = await apiClient.post<{ user: User }>('/auth/signin', { email, password });
    
    this.user = response.user;
    apiClient.setCurrentUser(response.user);
    
    this.startTokenExpiryTimer();
    
    return response.user;
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    const response = await apiClient.post<{ user: User }>('/auth/signup', { name, email, password });
    
    this.user = response.user;
    apiClient.setCurrentUser(response.user);
    
    this.startTokenExpiryTimer();
    
    return response.user;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    if (this.user) {
      return this.user;
    }
    
    const user = await apiClient.get<User>('/auth/profile');
    this.user = user;
    apiClient.setCurrentUser(user);
    return user;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }

  getUser(): User | null {
    return this.user;
  }

  private startTokenExpiryTimer() {
    this.clearTokenExpiryTimer();
    
    this.tokenExpiryTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 14 * 60 * 1000);
  }

  private async refreshToken() {
    try {
      await apiClient.post('/auth/refresh', {});
      this.startTokenExpiryTimer();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  private clearTokenExpiryTimer() {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  private clearAuth() {
    this.user = null;
    apiClient.setCurrentUser(null);
    this.clearTokenExpiryTimer();
  }
}

export const authService = new AuthService();