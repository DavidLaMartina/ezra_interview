import React from 'react';
import { SORT_OPTIONS } from '../types/Task';
import '../styles/SortControls.css';

interface SortControlProps {
  sortBy?: string;
  sortOrder?: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

const SortControls: React.FC<SortControlProps> = ({
  sortBy = '',
  sortOrder = 'asc',
  onSortChange,
}) => {
  const handleSortByChange = (newSortBy: string) => {
    onSortChange(newSortBy, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newSortOrder);
  };

  return (
    <div className="sort-controls">
      <div className="sort-field">
        <label htmlFor="sortBy">Sort by:</label>
        <select id="sortBy" value={sortBy} onChange={e => handleSortByChange(e.target.value)}>
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {sortBy && (
        <div className="sort-order">
          <button
            type="button"
            className={`btn btn-sm sort-order-btn ${sortOrder}`}
            onClick={handleSortOrderToggle}
            title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
            <span className="sort-order-text">
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SortControls;
