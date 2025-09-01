import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskListResponse } from '../types/Task';
import { taskApi } from '../services/api';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import FilterBar from './FilterBar';
import '../styles/TaskManager.css'

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | undefined>();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
  const [searchFilter, setSearchFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const loadTasks = async (cursor?: number, append = false) => {
    try {
      setLoading(!append);
      setError(null);

      const response: TaskListResponse = await taskApi.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search: searchFilter || undefined,
        includeDeleted: showDeleted,
        cursor,
        limit: 10
      });

      if (append) {
        setTasks(prev => [...prev, ...response.tasks]);
      } else {
        setTasks(response.tasks);
      }

      setHasNextPage(response.hasNextPage);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, searchFilter, showDeleted]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await taskApi.createTask(taskData);
      setShowCreateForm(false);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id: number, taskData: any) => {
    try {
      await taskApi.updateTask(id, taskData);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleRestoreTask = async (id: number) => {
    try {
      await taskApi.restoreTask(id);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore task');
    }
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await taskApi.bulkUpdate({
        taskIds: selectedTasks,
        status: TaskStatus.Completed
      });
      setSelectedTasks([]);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete tasks');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await taskApi.bulkUpdate({
        taskIds: selectedTasks,
        delete: true
      });
      setSelectedTasks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tasks');
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && nextCursor) {
      loadTasks(nextCursor, true);
    }
  }

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h1>Todo Manager</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Add Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <FilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchFilter={searchFilter}
        showDeleted={showDeleted}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchFilter}
        onShowDeletedChange={setShowDeleted}
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
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedTasks([])}
          >
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
          <button 
            className="btn btn-secondary" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {showCreateForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default TaskManager;