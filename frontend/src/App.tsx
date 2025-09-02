import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import AuthPage from './components/AuthPage';
import TaskManager from './components/TaskManager';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="authenticated-app">
      <Header />
      <main className="main-content">
        <TaskManager />
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </div>
  );
}

export default App;
