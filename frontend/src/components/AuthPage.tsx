import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { config } from '../config/env';
import '../styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1>{config.app.name}</h1>
          <p>Organize your tasks, boost your productivity</p>
        </div>

        <div className="auth-form-container">
          {isLoginMode ? (
            <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
          )}
        </div>
      </div>

      <div className="auth-demo-info">
        <div className="demo-credentials">
          <h3>Demo Account</h3>
          <p>Email: demo@example.com</p>
          <p>Password: Password123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
