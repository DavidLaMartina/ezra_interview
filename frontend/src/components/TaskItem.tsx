import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/Task';
import '../styles/TaskItem.css';

interface TaskItemProps {
  task: Task;
  selected: boolean;
  onSelect: (checkd: boolean) => void;
  onUpdate: (id: number, taskData: any) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onRestore,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    tags: task.tags,
  });

  const handleStatusToggle = () => {
    const newStatus =
      task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed;

    onUpdate(task.id, { ...task, status: newStatus });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(task.id, {
      ...editData,
      dueDate: editData.dueDate || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const parseTags = (tagsString: string): string[] => {
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Pending:
        return 'Pending';
      case TaskStatus.InProgress:
        return 'In Progress';
      case TaskStatus.Completed:
        return 'Completed';
      default:
        return 'Uknown';
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return 'Low';
      case TaskPriority.Medium:
        return 'Medium';
      case TaskPriority.High:
        return 'High';
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed;
  const isDeleted = !!task.deletedAt;

  return (
    <div
      className={`task-item ${isDeleted ? 'deleted' : ''} ${
        task.status === TaskStatus.Completed ? 'completed' : ''
      }`}
    >
      <div className="task-item-header">
        <label className="checkbox-wrapper">
          <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} />
          <span className="checkmark"></span>
        </label>

        <div className="task-item-main">
          {isEditing ? (
            <div className="task-edit-form">
              <input
                type="text"
                value={editData.title}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
                className="task-title-input"
                placeholder="Task title"
              />
              <textarea
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                className="task-description-input"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="task-edit-controls">
                <select
                  value={editData.status}
                  onChange={e =>
                    setEditData({ ...editData, status: Number(e.target.value) as TaskStatus })
                  }
                >
                  <option value={TaskStatus.Pending}>Pending</option>
                  <option value={TaskStatus.InProgress}>In Progress</option>
                  <option value={TaskStatus.Completed}>Completed</option>
                </select>
                <select
                  value={editData.priority}
                  onChange={e =>
                    setEditData({ ...editData, priority: Number(e.target.value) as TaskPriority })
                  }
                >
                  <option value={TaskPriority.Low}>Low</option>
                  <option value={TaskPriority.Medium}>Medium</option>
                  <option value={TaskPriority.High}>High</option>
                </select>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={e => setEditData({ ...editData, dueDate: e.target.value })}
                />
              </div>
              <div className="task-edit-actions">
                <button className="btn btn-success" onClick={handleSave}>
                  Save
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="task-content">
                <h3
                  className={`task-title ${
                    task.status === TaskStatus.Completed ? 'completed' : ''
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`task-status status-${task.status}`}>
                    {getStatusText(task.status)}
                  </span>
                  <span className={`task-priority priority-${task.priority}`}>
                    {getPriorityText(task.priority)}
                  </span>
                  {task.dueDate && (
                    <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                  {parseTags(task.tags).map(tag => (
                    <span key={tag} className="task-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="task-actions">
          {!isDeleted ? (
            <>
              <button
                className={`btn btn-sm ${
                  task.status === TaskStatus.Completed ? 'btn-secondary' : 'btn-success'
                }`}
                onClick={handleStatusToggle}
                title={
                  task.status === TaskStatus.Completed ? 'Mark as pending' : 'Mark as completed'
                }
              >
                {task.status === TaskStatus.Completed ? '↶' : '✓'}
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleEdit}>
                Edit
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-success" onClick={() => onRestore(task.id)}>
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
