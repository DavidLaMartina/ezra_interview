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
}

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
