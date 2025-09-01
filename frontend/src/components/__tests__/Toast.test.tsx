import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Toast, { ToastMessage } from '../Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  const baseToast: ToastMessage = {
    id: '1',
    type: 'success',
    title: 'Success',
    message: 'Operation completed successfully',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders toast with title and message', () => {
    render(<Toast toast={baseToast} onClose={mockOnClose} />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders correct icon for success toast', () => {
    render(<Toast toast={baseToast} onClose={mockOnClose} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders correct icon for error toast', () => {
    const errorToast = { ...baseToast, type: 'error' as const };
    render(<Toast toast={errorToast} onClose={mockOnClose} />);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders correct icon for warning toast', () => {
    const warningToast = { ...baseToast, type: 'warning' as const };
    render(<Toast toast={warningToast} onClose={mockOnClose} />);

    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders correct icon for info toast', () => {
    const infoToast = { ...baseToast, type: 'info' as const };
    render(<Toast toast={infoToast} onClose={mockOnClose} />);

    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('applies correct CSS class for toast type', () => {
    render(<Toast toast={baseToast} onClose={mockOnClose} />);

    const toastElement = screen.getByText('Success').closest('.toast');
    expect(toastElement).toHaveClass('toast-success');
  });

  it('renders validation errors when present', () => {
    const toastWithErrors: ToastMessage = {
      ...baseToast,
      type: 'error',
      validationErrors: [
        { field: 'title', message: 'Title is required' },
        { field: 'email', message: 'Invalid email format' },
      ],
    };

    render(<Toast toast={toastWithErrors} onClose={mockOnClose} />);

    expect(screen.getByText('title:')).toBeInTheDocument();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('email:')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Toast toast={baseToast} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('1');
  });

  it('auto-closes after default duration', async () => {
    render(<Toast toast={baseToast} onClose={mockOnClose} />);

    // Fast-forward time by 5 seconds (default duration)
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('1');
    });
  });

  it('auto-closes after custom duration', async () => {
    const customToast = { ...baseToast, duration: 3000 };
    render(<Toast toast={customToast} onClose={mockOnClose} />);

    // Fast-forward time by 3 seconds (custom duration)
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('1');
    });
  });

  it('does not render message when message is undefined', () => {
    const toastWithoutMessage = { ...baseToast, message: undefined };
    render(<Toast toast={toastWithoutMessage} onClose={mockOnClose} />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.queryByText('Operation completed successfully')).not.toBeInTheDocument();
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<Toast toast={baseToast} onClose={mockOnClose} />);

    unmount();

    // Fast-forward time - onClose should not be called
    jest.advanceTimersByTime(5000);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
