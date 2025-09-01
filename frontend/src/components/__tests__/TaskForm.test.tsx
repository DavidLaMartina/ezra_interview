import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import TaskForm from '../TaskForm';
import { TaskPriority } from '../../types/Task';

describe('TaskForm', () => {
  const mockProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<TaskForm {...mockProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for title too long', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'a'.repeat(201)); // 201 characters

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title must be less than 200 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'Task description');
    await user.selectOptions(screen.getByLabelText(/priority/i), TaskPriority.High.toString());
    await user.type(screen.getByLabelText(/due date/i), '2025-12-31');
    await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: TaskPriority.High,
        dueDate: '2025-12-31',
        tags: '["tag1","tag2"]',
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('sets minimum date for due date input', () => {
    render(<TaskForm {...mockProps} />);

    const dueDateInput = screen.getByLabelText(/due date/i);
    const today = new Date().toISOString().split('T')[0];
    expect(dueDateInput).toHaveAttribute('min', today);
  });

  it('processes tags correctly', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Task');
    await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2, tag3');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: '["tag1","tag2","tag3"]',
        })
      );
    });
  });
});
