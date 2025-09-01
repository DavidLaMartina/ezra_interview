import React, { useEffect } from 'react';
import { ValidationError } from '../types/Task';
import '../styles/Toast.css';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  validationErrors?: ValidationError[];
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-header">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-title">{toast.title}</span>
        <button className="toast-close" onClick={() => onClose(toast.id)}>
          ×
        </button>
      </div>
      {toast.message && <div className="toast-message">{toast.message}</div>}
      {toast.validationErrors && toast.validationErrors.length > 0 && (
        <div className="toast-validation-errors">
          <ul>
            {toast.validationErrors.map((error, index) => (
              <li key={index}>
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Toast;
