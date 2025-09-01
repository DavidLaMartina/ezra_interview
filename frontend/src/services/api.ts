import axios from 'axios';
import { config } from '../config/env';
import {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  BulkUpdateRequest,
  TaskStatus,
  TaskPriority,
} from '../types/Task';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Add request interceptor for debugging
if (config.features.enableDebug) {
  api.interceptors.request.use(
    request => {
      console.log('API Request:', request.method?.toUpperCase(), request.url, request.data);
      return request;
    },
    error => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    response => {
      console.log('API Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('API Response Error:', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );
}

export const taskApi = {
  // Get tasks with filtering and pagination
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
    // Use environment variable for default limit
    const finalParams = {
      ...params,
      limit: params.limit || config.features.paginationLimit,
    };

    const response = await api.get('/tasks', { params: finalParams });
    return response.data;
  },

  // Get single task
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, task: UpdateTaskRequest): Promise<void> => {
    await api.put(`/tasks/${id}`, task);
  },

  // Delete task (soft delete)
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Restore deleted task
  restoreTask: async (id: number): Promise<void> => {
    await api.post(`/tasks/${id}/restore`);
  },

  // Bulk operations
  bulkUpdate: async (request: BulkUpdateRequest): Promise<void> => {
    await api.patch('/tasks/bulk', request);
  },
};
