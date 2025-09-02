import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskListResponse, ApiError } from '../types/Task';
import { taskApi } from '../services/api';
import { useToast } from './ToastContainer';
import { config } from '../config/env';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import FilterBar from './FilterBar';
import '../styles/TaskManager.css';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | undefined>();

  // Filter states
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
  const [searchFilter, setSearchFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Sort states
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  // UI states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // Toast notifications
  const { showSuccess, showApiError } = useToast();

  // Load tasks
  const loadTasks = async (cursor?: number, append = false) => {
    try {
      setLoading(!append); // Don't show loading spinner for pagination

      const response: TaskListResponse = await taskApi.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search: searchFilter || undefined,
        includeDeleted: showDeleted,
        cursor,
        limit: config.features.paginationLimit,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder,
      });

      if (append) {
        setTasks(prev => [...prev, ...response.tasks]);
      } else {
        setTasks(response.tasks);
        // Clear selections when filters change
        setSelectedTasks([]);
      }

      setHasNextPage(response.hasNextPage);
      setNextCursor(response.nextCursor);
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to load tasks', 0));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial tasks and reload when filters/sort change
  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, searchFilter, showDeleted, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Handle task creation
  const handleCreateTask = async (taskData: any) => {
    try {
      await taskApi.createTask(taskData);
      setShowCreateForm(false);
      showSuccess('Success', 'Task created successfully');
      loadTasks(); // Refresh list
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to create task', 0));
      }
    }
  };

  // Handle task update
  const handleUpdateTask = async (id: number, taskData: any) => {
    try {
      await taskApi.updateTask(id, taskData);
      showSuccess('Success', 'Task updated successfully');
      loadTasks(); // Refresh list
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to update task', 0));
      }
    }
  };

  // Handle task delete
  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      showSuccess('Success', 'Task deleted successfully');
      loadTasks(); // Refresh list
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to delete task', 0));
      }
    }
  };

  // Handle task restore
  const handleRestoreTask = async (id: number) => {
    try {
      await taskApi.restoreTask(id);
      showSuccess('Success', 'Task restored successfully');
      loadTasks(); // Refresh list
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to restore task', 0));
      }
    }
  };

  // Handle bulk operations
  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await taskApi.bulkUpdate({
        taskIds: selectedTasks,
        status: TaskStatus.Completed,
      });
      setSelectedTasks([]);
      showSuccess('Success', `${selectedTasks.length} tasks completed successfully`);
      loadTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to complete tasks', 0));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await taskApi.bulkUpdate({
        taskIds: selectedTasks,
        delete: true,
      });
      setSelectedTasks([]);
      showSuccess('Success', `${selectedTasks.length} tasks deleted successfully`);
      loadTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        showApiError(error);
      } else {
        showApiError(new ApiError('Failed to delete tasks', 0));
      }
    }
  };

  // Load more tasks (pagination)
  const handleLoadMore = () => {
    if (hasNextPage && nextCursor) {
      loadTasks(nextCursor, true);
    }
  };

  // Get current sort display
  const getCurrentSortDisplay = () => {
    if (!sortBy) return 'Default';
    const sortLabel =
      {
        duedate: 'Due Date',
        created: 'Created Date',
        updated: 'Updated Date',
        priority: 'Priority',
        status: 'Status',
        title: 'Title',
      }[sortBy] || sortBy;

    return `${sortLabel} (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`;
  };

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <div>
          <h1>My Tasks</h1>
          <p className="task-count">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {sortBy && (
              <span className="sort-indicator"> • Sorted by {getCurrentSortDisplay()}</span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          + Add Task
        </button>
      </div>

      <FilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchFilter={searchFilter}
        showDeleted={showDeleted}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchFilter}
        onShowDeletedChange={setShowDeleted}
        onSortChange={handleSortChange}
      />

      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedTasks.length} tasks selected</span>
          <button className="btn btn-success" onClick={handleBulkComplete}>
            Mark Complete
          </button>
          <button className="btn btn-danger" onClick={handleBulkDelete}>
            Delete Selected
          </button>
          <button className="btn btn-secondary" onClick={() => setSelectedTasks([])}>
            Clear Selection
          </button>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <TaskList
          tasks={tasks}
          selectedTasks={selectedTasks}
          onSelectionChange={setSelectedTasks}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onRestore={handleRestoreTask}
        />
      )}

      {hasNextPage && (
        <div className="load-more">
          <button className="btn btn-secondary" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {showCreateForm && (
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowCreateForm(false)} />
      )}

      {/* Floating action button for mobile */}
      <button className="fab-button" onClick={() => setShowCreateForm(true)} title="Add Task">
        +
      </button>
    </div>
  );
};

export default TaskManager;
