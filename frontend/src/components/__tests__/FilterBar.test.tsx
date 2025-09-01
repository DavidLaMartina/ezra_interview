import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import FilterBar from '../FilterBar';
import { TaskStatus, TaskPriority } from '../../types/Task';

describe('FilterBar', () => {
  const mockProps = {
    statusFilter: undefined,
    priorityFilter: undefined,
    searchFilter: '',
    showDeleted: false,
    onStatusChange: jest.fn(),
    onPriorityChange: jest.fn(),
    onSearchChange: jest.fn(),
    onShowDeletedChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter elements', () => {
    render(<FilterBar {...mockProps} />);

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show deleted/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'test search');

    expect(mockProps.onSearchChange).toHaveBeenLastCalledWith('test search');
  });

  it('calls onStatusChange when status filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, TaskStatus.Completed.toString());

    expect(mockProps.onStatusChange).toHaveBeenCalledWith(TaskStatus.Completed);
  });

  it('calls onStatusChange with undefined when "All Status" is selected', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} statusFilter={TaskStatus.Pending} />);

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, '');

    expect(mockProps.onStatusChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onPriorityChange when priority filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.selectOptions(prioritySelect, TaskPriority.High.toString());

    expect(mockProps.onPriorityChange).toHaveBeenCalledWith(TaskPriority.High);
  });

  it('calls onShowDeletedChange when show deleted checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...mockProps} />);

    const showDeletedCheckbox = screen.getByLabelText(/show deleted/i);
    await user.click(showDeletedCheckbox);

    expect(mockProps.onShowDeletedChange).toHaveBeenCalledWith(true);
  });

  it('displays current filter values correctly', () => {
    render(
      <FilterBar
        {...mockProps}
        statusFilter={TaskStatus.InProgress}
        priorityFilter={TaskPriority.High}
        searchFilter="test query"
        showDeleted={true}
      />
    );

    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // InProgress = 1
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // High = 2
    expect(screen.getByLabelText(/show deleted/i)).toBeChecked();
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterBar
        {...mockProps}
        statusFilter={TaskStatus.Completed}
        priorityFilter={TaskPriority.Low}
        searchFilter="some search"
        showDeleted={true}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await user.click(clearButton);

    expect(mockProps.onStatusChange).toHaveBeenCalledWith(undefined);
    expect(mockProps.onPriorityChange).toHaveBeenCalledWith(undefined);
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('');
    expect(mockProps.onShowDeletedChange).toHaveBeenCalledWith(false);
  });

  it('shows correct status options', () => {
    render(<FilterBar {...mockProps} />);

    const statusSelect = screen.getByLabelText(/status/i);

    expect(statusSelect).toContainHTML('<option value="">All Status</option>');
    expect(statusSelect).toContainHTML('<option value="0">Pending</option>');
    expect(statusSelect).toContainHTML('<option value="1">In Progress</option>');
    expect(statusSelect).toContainHTML('<option value="2">Completed</option>');
  });

  it('shows correct priority options', () => {
    render(<FilterBar {...mockProps} />);

    const prioritySelect = screen.getByLabelText(/priority/i);

    expect(prioritySelect).toContainHTML('<option value="">All Priorities</option>');
    expect(prioritySelect).toContainHTML('<option value="0">Low</option>');
    expect(prioritySelect).toContainHTML('<option value="1">Medium</option>');
    expect(prioritySelect).toContainHTML('<option value="2">High</option>');
  });
});
