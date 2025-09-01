import { taskApi } from '../services/api';
import { mockTasks, mockTaskListResponse } from './mockData';
import { TaskStatus, TaskPriority } from '../types/Task';

// Mock the entire API module
jest.mock('../services/api', () => ({
  taskApi: {
    getTasks: jest.fn(),
    getTask: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    restoreTask: jest.fn(),
    bulkUpdate: jest.fn(),
  },
}));

export const mockTaskApi = taskApi as jest.Mocked<typeof taskApi>;

// Default mock implementations
export const setupDefaultMocks = () => {
  mockTaskApi.getTasks.mockResolvedValue(mockTaskListResponse);
  mockTaskApi.getTask.mockImplementation(id => {
    const task = mockTasks.find(t => t.id === id);
    return task ? Promise.resolve(task) : Promise.reject(new Error('Task not found'));
  });
  mockTaskApi.createTask.mockResolvedValue({
    ...mockTasks[0],
    id: Date.now(),
    title: 'New Task',
  });
  mockTaskApi.updateTask.mockResolvedValue(undefined);
  mockTaskApi.deleteTask.mockResolvedValue(undefined);
  mockTaskApi.restoreTask.mockResolvedValue(undefined);
  mockTaskApi.bulkUpdate.mockResolvedValue(undefined);
};

export const resetMocks = () => {
  Object.values(mockTaskApi).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};
