import React from 'react';
import TaskManager from './components/TaskManager';
import { ToastProvider } from './components/ToastContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <TaskManager />
      </ToastProvider>
    </div>
  );
}

export default App;
