import axios from 'axios';
import { Task, TaskListResponse, CreateTaskRequest, UpdateTaskRequest, BulkUpdateRequest, TaskStatus, TaskPriority } from '../types/Task';

const API_BASE_URL = 'http://localhost:5069/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const taskApi = {
  getTasks: async (params: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    includeDeleted?: boolean;
    cursor?: number;
    limit?: number;
  } = {}) : Promise<TaskListResponse> => {
    const response = await api.get('./tasks', { params });
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('./tasks', task);
    return response.data;
  },

  updateTask: async (id: number, task: UpdateTaskRequest): Promise<void> => {
    await api.put(`/tasks/${id}`, task);
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  restoreTask: async (id: number): Promise<void> => {
    await api.post(`/tasks/${id}/restore`);
  },

  bulkUpdate: async (request: BulkUpdateRequest): Promise<void> => {
    await api.patch('/tasks/bulk', request);
  },
};