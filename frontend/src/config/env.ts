interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
  };
  features: {
    enableDebug: boolean;
    paginationLimit: number;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid number for ${key}: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('REACT_APP_API_BASE_URL'),
    timeout: getNumberEnvVar('REACT_APP_API_TIMEOUT', 10000),
  },
  app: {
    name: getEnvVar('REACT_APP_APP_NAME', 'Todo Manager'),
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  },
  features: {
    enableDebug: getBooleanEnvVar('REACT_APP_ENABLE_DEBUG', false),
    paginationLimit: getNumberEnvVar('REACT_APP_PAGINATION_LIMIT', 10),
  },
};

if (config.features.enableDebug) {
  console.log('App Configuration:', config);
}