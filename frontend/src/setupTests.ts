// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/api';
process.env.REACT_APP_API_TIMEOUT = '5000';
process.env.REACT_APP_APP_NAME = 'Todo Manager Test';
process.env.REACT_APP_VERSION = '1.0.0';
process.env.REACT_APP_ENABLE_DEBUG = 'false';
process.env.REACT_APP_PAGINATION_LIMIT = '10';
