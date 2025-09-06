/**
 * Error handling and logging utilities
 *
 * @package Rate_Compare
 * @since 1.0.0
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  CACHE = 'cache',
  CONFIGURATION = 'configuration',
  RATE_FETCHING = 'rate_fetching',
  COMPARISON = 'comparison',
  UNKNOWN = 'unknown'
}

/**
 * Custom error class for rate comparison system
 */
export class RateCompareError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'RateCompareError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateCompareError);
    }
  }

  /**
   * Convert error to plain object for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
      stack: this.stack
    };
  }
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  logLevel: ErrorSeverity;
  maxLogEntries: number;
  remoteLoggingEndpoint?: string;
  enableStackTrace: boolean;
}

/**
 * Default error handler configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  logLevel: ErrorSeverity.LOW,
  maxLogEntries: 1000,
  enableStackTrace: true
};

/**
 * Error handler class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private logEntries: Array<Record<string, any>> = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update error handler configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Log an error
   */
  logError(error: Error | RateCompareError, context?: Record<string, any>): void {
    const errorData = this.prepareErrorData(error, context);
    
    // Add to internal log
    this.addToLog(errorData);
    
    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorData);
    }
    
    // Remote logging
    if (this.config.enableRemoteLogging && this.config.remoteLoggingEndpoint) {
      this.logToRemote(errorData);
    }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Record<string, any>): void {
    const warningData = {
      level: 'warning',
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: this.config.enableStackTrace ? new Error().stack : undefined
    };

    this.addToLog(warningData);
    
    if (this.config.enableConsoleLogging) {
      console.warn(`[Rate Compare Warning] ${message}`, context);
    }
  }

  /**
   * Log an info message
   */
  logInfo(message: string, context?: Record<string, any>): void {
    const infoData = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString()
    };

    this.addToLog(infoData);
    
    if (this.config.enableConsoleLogging) {
      console.info(`[Rate Compare Info] ${message}`, context);
    }
  }

  /**
   * Log a debug message
   */
  logDebug(message: string, context?: Record<string, any>): void {
    const debugData = {
      level: 'debug',
      message,
      context,
      timestamp: new Date().toISOString()
    };

    this.addToLog(debugData);
    
    if (this.config.enableConsoleLogging && process.env.NODE_ENV === 'development') {
      console.debug(`[Rate Compare Debug] ${message}`, context);
    }
  }

  /**
   * Get all log entries
   */
  getLogs(): Array<Record<string, any>> {
    return [...this.logEntries];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logEntries = [];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): Array<Record<string, any>> {
    return this.logEntries.filter(entry => entry.severity === severity);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ErrorCategory): Array<Record<string, any>> {
    return this.logEntries.filter(entry => entry.category === category);
  }

  /**
   * Prepare error data for logging
   */
  private prepareErrorData(error: Error | RateCompareError, context?: Record<string, any>): Record<string, any> {
    const baseData = {
      timestamp: new Date().toISOString(),
      stack: this.config.enableStackTrace ? error.stack : undefined
    };

    if (error instanceof RateCompareError) {
      return {
        ...baseData,
        level: 'error',
        name: error.name,
        message: error.message,
        code: error.code,
        severity: error.severity,
        category: error.category,
        context: { ...error.context, ...context },
        isOperational: error.isOperational
      };
    }

    return {
      ...baseData,
      level: 'error',
      name: error.name,
      message: error.message,
      code: 'UNKNOWN_ERROR',
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      context,
      isOperational: false
    };
  }

  /**
   * Add entry to internal log
   */
  private addToLog(data: Record<string, any>): void {
    this.logEntries.push(data);
    
    // Maintain max log entries
    if (this.logEntries.length > this.config.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxLogEntries);
    }
  }

  /**
   * Log to console
   */
  private logToConsole(data: Record<string, any>): void {
    const { level, message, severity, category, context, stack } = data;
    
    const logMessage = `[Rate Compare ${level.toUpperCase()}] ${message}`;
    const logData = { severity, category, context, stack };

    switch (level) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warning':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      case 'debug':
        console.debug(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  /**
   * Log to remote endpoint
   */
  private async logToRemote(data: Record<string, any>): Promise<void> {
    if (!this.config.remoteLoggingEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteLoggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      // Don't log remote logging errors to avoid infinite loops
      console.warn('[Rate Compare] Failed to log to remote endpoint:', error);
    }
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Convenience functions for common error scenarios
 */

/**
 * Create a validation error
 */
export function createValidationError(message: string, context?: Record<string, any>): RateCompareError {
  return new RateCompareError(
    message,
    'VALIDATION_ERROR',
    ErrorSeverity.MEDIUM,
    ErrorCategory.VALIDATION,
    context
  );
}

/**
 * Create a network error
 */
export function createNetworkError(message: string, context?: Record<string, any>): RateCompareError {
  return new RateCompareError(
    message,
    'NETWORK_ERROR',
    ErrorSeverity.HIGH,
    ErrorCategory.NETWORK,
    context
  );
}

/**
 * Create an API error
 */
export function createAPIError(message: string, context?: Record<string, any>): RateCompareError {
  return new RateCompareError(
    message,
    'API_ERROR',
    ErrorSeverity.HIGH,
    ErrorCategory.API,
    context
  );
}

/**
 * Create a configuration error
 */
export function createConfigurationError(message: string, context?: Record<string, any>): RateCompareError {
  return new RateCompareError(
    message,
    'CONFIGURATION_ERROR',
    ErrorSeverity.MEDIUM,
    ErrorCategory.CONFIGURATION,
    context
  );
}

/**
 * Create a rate fetching error
 */
export function createRateFetchingError(message: string, context?: Record<string, any>): RateCompareError {
  return new RateCompareError(
    message,
    'RATE_FETCHING_ERROR',
    ErrorSeverity.HIGH,
    ErrorCategory.RATE_FETCHING,
    context
  );
}

/**
 * Handle promise rejections
 */
export function handlePromiseRejection(error: any, context?: Record<string, any>, handler: ErrorHandler = errorHandler): void {
  if (error instanceof RateCompareError) {
    handler.logError(error, context);
  } else {
    handler.logError(new Error(String(error)), context);
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>,
  handler: ErrorHandler = errorHandler
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handlePromiseRejection(error, { ...context, args }, handler);
      return null;
    }
  };
}

/**
 * Wrap sync function with error handling
 */
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, any>,
  handler: ErrorHandler = errorHandler
): (...args: T) => R | null {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      handlePromiseRejection(error, { ...context, args }, handler);
      return null;
    }
  };
}
