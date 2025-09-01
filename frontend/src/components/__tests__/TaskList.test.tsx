import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import TaskList from '../TaskList';
import { mockTasks } from '../../test-utils/mockData';

describe('TaskList', () => {
  const mockProps = {
    tasks: mockTasks,
    selectedTasks: [],
    onSelectionChange: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onRestore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tasks', () => {
    render(<TaskList {...mockProps} />);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();
  });

  it('renders select all checkbox', () => {
    render(<TaskList {...mockProps} />);

    expect(screen.getByText('Select All (3)')).toBeInTheDocument();
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(selectAllCheckbox).not.toBeChecked();
  });

  it('shows select all as checked when all tasks are selected', () => {
    render(<TaskList {...mockProps} selectedTasks={[1, 2, 3]} />);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    expect(selectAllCheckbox).toBeChecked();
  });

  it('shows select all as indeterminate when some tasks are selected', () => {
    render(<TaskList {...mockProps} selectedTasks={[1, 2]} />);

    const selectAllCheckbox = screen.getByRole('checkbox', {
      name: /select all/i,
    }) as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it('selects all tasks when select all is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList {...mockProps} />);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    await user.click(selectAllCheckbox);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('deselects all tasks when select all is unchecked', async () => {
    const user = userEvent.setup();
    render(<TaskList {...mockProps} selectedTasks={[1, 2, 3]} />);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    await user.click(selectAllCheckbox);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('passes correct props to TaskItem components', () => {
    render(<TaskList {...mockProps} selectedTasks={[1]} />);

    // Check that the first task is marked as selected
    const taskCheckboxes = screen.getAllByRole('checkbox');
    const firstTaskCheckbox = taskCheckboxes[1]; // Skip select all checkbox
    expect(firstTaskCheckbox).toBeChecked();

    // Check that other tasks are not selected
    const secondTaskCheckbox = taskCheckboxes[2];
    expect(secondTaskCheckbox).not.toBeChecked();
  });

  it('calls onSelectionChange when individual task is selected', async () => {
    const user = userEvent.setup();
    render(<TaskList {...mockProps} />);

    const taskCheckboxes = screen.getAllByRole('checkbox');
    const firstTaskCheckbox = taskCheckboxes[1]; // Skip select all checkbox
    await user.click(firstTaskCheckbox);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('calls onSelectionChange when individual task is deselected', async () => {
    const user = userEvent.setup();
    render(<TaskList {...mockProps} selectedTasks={[1, 2]} />);

    const taskCheckboxes = screen.getAllByRole('checkbox');
    const firstTaskCheckbox = taskCheckboxes[1]; // Skip select all checkbox
    await user.click(firstTaskCheckbox);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([2]);
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList {...mockProps} tasks={[]} />);

    expect(
      screen.getByText('No tasks found. Create your first task to get started!')
    ).toBeInTheDocument();
    expect(screen.queryByText('Select All')).not.toBeInTheDocument();
  });

  it('passes through event handlers to TaskItem components', () => {
    render(<TaskList {...mockProps} />);

    // Verify that TaskItem receives the correct props
    // This is more of an integration test - the individual handlers
    // are tested in TaskItem.test.tsx
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles task count display correctly', () => {
    render(<TaskList {...mockProps} />);
    expect(screen.getByText('Select All (3)')).toBeInTheDocument();

    // Test with different task count
    const { rerender } = render(<TaskList {...mockProps} tasks={mockTasks.slice(0, 1)} />);
    expect(screen.getByText('Select All (1)')).toBeInTheDocument();
  });
});
