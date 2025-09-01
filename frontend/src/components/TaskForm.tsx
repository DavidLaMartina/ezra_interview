import React, { useState } from 'react';
import { TaskPriority } from '../types/Task';
import '../styles/TaskForm.css';

interface TaskFormProps {
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.tags) {
      try {
        const tags = formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
        JSON.stringify(tags); // Validate that we can create valid JSON
      } catch {
        newErrors.tags = 'Invalid tags format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Process tags into JSON format
    const tags = formData.tags
      ? JSON.stringify(
          formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
        )
      : '[]';

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      tags,
    };

    onSubmit(taskData);
  };

  const handleInputChange = (field: string, value: string | TaskPriority) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter task title"
              maxLength={200}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e =>
                  handleInputChange('priority', Number(e.target.value) as TaskPriority)
                }
              >
                <option value={TaskPriority.Low}>Low</option>
                <option value={TaskPriority.Medium}>Medium</option>
                <option value={TaskPriority.High}>High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={e => handleInputChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={e => handleInputChange('tags', e.target.value)}
              className={errors.tags ? 'error' : ''}
              placeholder="Enter tags separated by commas (e.g., urgent, work, personal)"
            />
            {errors.tags && <span className="error-text">{errors.tags}</span>}
            <small className="help-text">Separate multiple tags with commas</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
