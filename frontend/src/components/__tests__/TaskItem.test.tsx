import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import TaskItem from '../TaskItem';
import { mockTasks } from '../../test-utils/mockData';
import { TaskStatus } from '../../types/Task';

describe('TaskItem', () => {
  const mockProps = {
    task: mockTasks[0],
    selected: false,
    onSelect: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onRestore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(<TaskItem {...mockProps} />);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows checkbox as unchecked when not selected', () => {
    render(<TaskItem {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('shows checkbox as checked when selected', () => {
    render(<TaskItem {...mockProps} selected={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onSelect when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockProps.onSelect).toHaveBeenCalledWith(true);
  });

  it('shows due date when task has due date', () => {
    render(<TaskItem {...mockProps} />);

    expect(screen.getByText(/Due: /)).toBeInTheDocument();
  });

  it('shows overdue styling for past due tasks', () => {
    const overdueTask = {
      ...mockTasks[0],
      dueDate: '2025-08-01T00:00:00Z', // Past date
      status: TaskStatus.Pending,
    };

    render(<TaskItem {...mockProps} task={overdueTask} />);

    const dueDateElement = screen.getByText(/Due: /);
    expect(dueDateElement).toHaveClass('overdue');
  });

  it('shows tags when task has tags', () => {
    render(<TaskItem {...mockProps} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('shows completed styling for completed tasks', () => {
    const completedTask = {
      ...mockTasks[1],
      status: TaskStatus.Completed,
    };

    render(<TaskItem {...mockProps} task={completedTask} />);

    const taskItem = screen.getByText('Test Task 2').closest('.task-item');
    expect(taskItem).toHaveClass('completed');
  });

  it('shows delete and edit buttons for active tasks', () => {
    render(<TaskItem {...mockProps} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Restore')).not.toBeInTheDocument();
  });

  it('shows restore button for deleted tasks', () => {
    const deletedTask = {
      ...mockTasks[0],
      deletedAt: '2025-08-29T10:00:00Z',
    };

    render(<TaskItem {...mockProps} task={deletedTask} />);

    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTasks[0].id);
  });

  it('toggles task status when status button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);

    const statusButton = screen.getByTitle('Mark as completed');
    await user.click(statusButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith(mockTasks[0].id, {
      ...mockTasks[0],
      status: TaskStatus.Completed,
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('saves changes when save button is clicked in edit mode', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);

    // Enter edit mode
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // Change title
    const titleInput = screen.getByDisplayValue('Test Task 1');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task Title');

    // Save changes
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith(mockTasks[0].id, {
      title: 'Updated Task Title',
      description: 'Test description 1',
      status: TaskStatus.Pending,
      priority: mockTasks[0].priority,
      dueDate: '2025-09-05',
      tags: '["test", "urgent"]',
    });
  });
});
