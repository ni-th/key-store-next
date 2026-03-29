// lib/api.ts
import axios from "axios";
import { getSession } from "next-auth/react";

// Create a custom axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor: Automatically add token to every request
api.interceptors.request.use(
  async (config) => {
    // Get the current session
    const session = await getSession();
    
    // If there's an access token, add it to the Authorization header
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      // Not found
      console.error("Resource not found");
    } else if (error.code === "ECONNABORTED") {
      // Timeout
      console.error("Request timeout - server might be slow");
    } else if (!error.response) {
      // Network error
      console.error("Network error - check your internet connection");
    }
    
    return Promise.reject(error);
  }
);

export default api;