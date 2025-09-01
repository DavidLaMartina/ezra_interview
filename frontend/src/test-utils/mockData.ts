import { Task, TaskStatus, TaskPriority, TaskListResponse } from '../types/Task';

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Test description 1',
    status: TaskStatus.Pending,
    priority: TaskPriority.High,
    tags: '["test", "urgent"]',
    dueDate: '2025-09-05T00:00:00Z',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Test description 2',
    status: TaskStatus.Completed,
    priority: TaskPriority.Medium,
    tags: '["test"]',
    createdAt: '2025-08-30T10:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z'
  },
  {
    id: 3,
    title: 'Test Task 3',
    description: 'Test description 3',
    status: TaskStatus.InProgress,
    priority: TaskPriority.Low,
    tags: '[]',
    dueDate: '2025-09-10T00:00:00Z',
    createdAt: '2025-08-29T10:00:00Z',
    updatedAt: '2025-09-01T08:00:00Z'
  }
];

export const mockTaskListResponse: TaskListResponse = {
  tasks: mockTasks,
  hasNextPage: false,
  nextCursor: undefined,
  limit: 10
};

export const mockDeletedTask: Task = {
  id: 4,
  title: 'Deleted Task',
  description: 'This task was deleted',
  status: TaskStatus.Completed,
  priority: TaskPriority.Low,
  tags: '["deleted"]',
  createdAt: '2025-08-28T10:00:00Z',
  updatedAt: '2025-08-29T10:00:00Z',
  deletedAt: '2025-08-29T10:00:00Z'
};