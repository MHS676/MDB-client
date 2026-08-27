/**
 * Professional Logging and Error Handling Utilities
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const logMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(`${logEntry}:`, data);
  } else {
    console.log(logEntry);
  }

  // In production, send logs to a logging service
  if (import.meta.env.MODE === 'production') {
    // Implement your logging service here
    // Example: sendToLoggingService(level, message, data);
  }
};

export const logger = {
  error: (message, data) => logMessage(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => logMessage(LOG_LEVELS.WARN, message, data),
  info: (message, data) => logMessage(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => logMessage(LOG_LEVELS.DEBUG, message, data),
};

/**
 * Error handler for API responses
 */
export const handleApiError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.status === 401) {
    logger.warn('Unauthorized - redirecting to login');
    return 'Session expired. Please login again.';
  }
  
  if (error.status === 403) {
    logger.warn('Forbidden - insufficient permissions');
    return 'You do not have permission to perform this action.';
  }
  
  if (error.status === 404) {
    logger.warn('Resource not found');
    return 'The requested resource was not found.';
  }
  
  if (error.status >= 500) {
    logger.error('Server error', error);
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error('JSON parse error', error);
    return fallback;
  }
};

/**
 * Retry mechanism for failed requests
 */
export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
