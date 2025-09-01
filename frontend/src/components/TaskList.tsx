import React from 'react';
import { Task } from '../types/Task';
import TaskItem from './TaskItem';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  selectedTasks: number[];
  onSelectionChange: (selected: number[]) => void;
  onUpdate: (id: number, taskData: any) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTasks,
  onSelectionChange,
  onUpdate,
  onDelete,
  onRestore,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tasks.map(task => task.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTasks, taskId]);
    } else {
      onSelectionChange(selectedTasks.filter(id => id !== taskId));
    }
  };

  const isAllSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const isPartiallySelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks found. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={input => {
              if (input) input.indeterminate = isPartiallySelected;
            }}
            onChange={e => handleSelectAll(e.target.checked)}
          />
          <span className="checkmark"></span>
          Select All ({tasks.length})
        </label>
      </div>

      <div className="task-list-items">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            selected={selectedTasks.includes(task.id)}
            onSelect={checked => handleSelectTask(task.id, checked)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
