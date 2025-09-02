import React from 'react';
import { TaskStatus, TaskPriority } from '../types/Task';
import SortControls from './SortControls';
import '../styles/FilterBar.css';

interface FilterBarProps {
  statusFilter?: TaskStatus;
  priorityFilter?: TaskPriority;
  searchFilter: string;
  showDeleted: boolean;
  sortBy?: string;
  sortOrder?: string;
  onStatusChange: (status?: TaskStatus) => void;
  onPriorityChange: (priority?: TaskPriority) => void;
  onSearchChange: (search: string) => void;
  onShowDeletedChange: (show: boolean) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  priorityFilter,
  searchFilter,
  showDeleted,
  sortBy,
  sortOrder,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onShowDeletedChange,
  onSortChange,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3>Filters</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={e => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter ?? ''}
              onChange={e =>
                onStatusChange(e.target.value ? (Number(e.target.value) as TaskStatus) : undefined)
              }
            >
              <option value="">All Status</option>
              <option value={TaskStatus.Pending}>Pending</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Completed}>Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={priorityFilter ?? ''}
              onChange={e =>
                onPriorityChange(
                  e.target.value ? (Number(e.target.value) as TaskPriority) : undefined
                )
              }
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.Low}>Low</option>
              <option value={TaskPriority.Medium}>Medium</option>
              <option value={TaskPriority.High}>High</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={e => onShowDeletedChange(e.target.checked)}
              />
              <span className="checkmark"></span>
              Show Deleted
            </label>
          </div>
        </div>
      </div>

      <div className="sort-section">
        <h3>Sort</h3>
        <SortControls sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
      </div>

      <div className="filter-actions">
        <button
          className="btn btn-secondary"
          onClick={() => {
            onStatusChange(undefined);
            onPriorityChange(undefined);
            onSearchChange('');
            onShowDeletedChange(false);
            onSortChange('', 'asc');
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
