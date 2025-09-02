import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/env';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>{config.app.name}</h1>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Hello, {user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>

          <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
