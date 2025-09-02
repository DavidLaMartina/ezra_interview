export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expires: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export enum TaskStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export interface TaskListResponse {
  tasks: Task[];
  hasNextPage: boolean;
  nextCursor?: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: '', label: 'Default' },
  { value: 'duedate', label: 'Due Date' },
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Updated Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string;
}

export interface BulkUpdateRequest {
  taskIds: number[];
  status?: TaskStatus;
  delete?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ApiResponseBase {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public validationErrors?: ValidationError[]) {
    super(message);
    this.name = 'ApiError';
  }
}
