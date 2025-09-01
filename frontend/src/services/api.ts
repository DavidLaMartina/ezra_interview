import axios, { AxiosError } from 'axios';
import { config } from '../config/env';
import {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  BulkUpdateRequest,
  TaskStatus,
  TaskPriority,
  ApiResponse,
  ApiResponseBase,
  ApiError,
} from '../types/Task';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    const responseData = error.response.data as ApiResponseBase;

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

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    handleApiError(error);
  }
);

if (config.features.enableDebug) {
  api.interceptors.request.use(request => {
    console.log('API Request:', request.method?.toUpperCase(), request.url, request.data);
    return request;
  });
}

export const taskApi = {
  getTasks: async (
    params: {
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
      includeDeleted?: boolean;
      cursor?: number;
      limit?: number;
    } = {}
  ): Promise<TaskListResponse> => {
    const finalParams = {
      ...params,
      limit: params.limit || config.features.paginationLimit,
    };

    const response = await api.get<ApiResponse<TaskListResponse>>('/tasks', {
      params: finalParams,
    });

    if (!response.data.success || !response.data.data) {
      throw new ApiError(response.data.message || 'Failed to fetch tasks', response.status);
    }

    return response.data.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new ApiError(response.data.message || 'Failed to fetch task', response.status);
    }

    return response.data.data;
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', task);

    if (!response.data.success || !response.data.data) {
      throw new ApiError(
        response.data.message || 'Failed to create task',
        response.status,
        response.data.errors
      );
    }

    return response.data.data;
  },

  updateTask: async (id: number, task: UpdateTaskRequest): Promise<void> => {
    const response = await api.put<ApiResponseBase>(`/tasks/${id}`, task);

    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to update task',
        response.status,
        response.data.errors
      );
    }
  },

  deleteTask: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponseBase>(`/tasks/${id}`);

    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Failed to delete task', response.status);
    }
  },

  restoreTask: async (id: number): Promise<void> => {
    const response = await api.post<ApiResponseBase>(`/tasks/${id}/restore`);

    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Failed to restore task', response.status);
    }
  },

  bulkUpdate: async (request: BulkUpdateRequest): Promise<void> => {
    const response = await api.patch<ApiResponseBase>('/tasks/bulk', request);

    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to perform bulk update',
        response.status,
        response.data.errors
      );
    }
  },
};
