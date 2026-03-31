// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true, // 🔑 CRITICAL: This sends/receives cookies automatically
    });

    // 🛡️ Response interceptor for handling token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh tokens (cookies are sent automatically)
            await this.refreshTokens();
            
            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // 🔄 Refresh tokens using the refresh endpoint
  private async refreshTokens(): Promise<void> {
    try {
      // Cookies are sent automatically with withCredentials: true
      await this.client.post('/auth/refresh', {});
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  // 🚪 Clear auth state (redirect to login)
  private clearAuth(): void {
    // Remove any stored user data from localStorage/sessionStorage if you have any
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }

  // ✨ No setToken method needed anymore - cookies handle it!

  // GET
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  // POST
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  // PUT
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  // PATCH
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // DELETE
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

// singleton
export const apiClient = new ApiClient();
export default apiClient;