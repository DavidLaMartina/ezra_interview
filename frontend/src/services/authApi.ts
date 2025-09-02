import axios, { AxiosError } from 'axios';
import { config } from '../config/env';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
  ApiError,
} from '../types/Task';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Enhanced error handling
const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    const responseData = error.response.data as ApiResponse<any>;

    throw new ApiError(
      responseData?.message || 'An error occurred',
      error.response.status,
      responseData?.errors
    );
  } else if (error.request) {
    throw new ApiError('Network error - please check your connection', 0);
  } else {
    throw new ApiError('An unexpected error occurred', 0);
  }
};

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    handleApiError(error);
  }
);

export const authApi = {
  // Login user
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', request);

    if (!response.data.success || !response.data.data) {
      throw new ApiError(
        response.data.message || 'Login failed',
        response.status,
        response.data.errors
      );
    }

    return response.data.data;
  },

  // Register user
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', request);

    if (!response.data.success || !response.data.data) {
      throw new ApiError(
        response.data.message || 'Registration failed',
        response.status,
        response.data.errors
      );
    }

    return response.data.data;
  },

  // Get current user info
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new ApiError(response.data.message || 'Failed to get user info', response.status);
    }

    return response.data.data;
  },
};
