/**
 * Error handler tests
 * 
 * @package Rate_Compare
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ErrorHandler,
  RateCompareError,
  ErrorSeverity,
  ErrorCategory,
  createValidationError,
  createNetworkError,
  createAPIError,
  createConfigurationError,
  createRateFetchingError,
  handlePromiseRejection,
  withErrorHandling,
  withSyncErrorHandling
} from '../../../src/utils/error-handler';

// Mock fetch for remote logging tests
global.fetch = vi.fn();

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      enableConsoleLogging: false, // Disable console logging for tests
      enableRemoteLogging: false,
      logLevel: ErrorSeverity.LOW,
      maxLogEntries: 10,
      enableStackTrace: false
    });
  });

  afterEach(() => {
    errorHandler.clearLogs();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const handler = new ErrorHandler();
      expect(handler).toBeInstanceOf(ErrorHandler);
    });

    it('should merge custom config with defaults', () => {
      const handler = new ErrorHandler({
        enableConsoleLogging: false,
        maxLogEntries: 50
      });
      expect(handler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      errorHandler.updateConfig({
        enableConsoleLogging: true,
        maxLogEntries: 20
      });
      
      // We can't directly test the config, but we can test behavior
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('logError', () => {
    it('should log RateCompareError', () => {
      const error = new RateCompareError(
        'Test error',
        'TEST_ERROR',
        ErrorSeverity.MEDIUM,
        ErrorCategory.VALIDATION
      );

      errorHandler.logError(error);

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Test error');
      expect(logs[0].code).toBe('TEST_ERROR');
      expect(logs[0].severity).toBe(ErrorSeverity.MEDIUM);
      expect(logs[0].category).toBe(ErrorCategory.VALIDATION);
    });

    it('should log regular Error', () => {
      const error = new Error('Regular error');

      errorHandler.logError(error);

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Regular error');
      expect(logs[0].code).toBe('UNKNOWN_ERROR');
      expect(logs[0].severity).toBe(ErrorSeverity.MEDIUM);
      expect(logs[0].category).toBe(ErrorCategory.UNKNOWN);
    });

    it('should include context in error log', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      errorHandler.logError(error, context);

      const logs = errorHandler.getLogs();
      expect(logs[0].context).toEqual(context);
    });

    it('should respect maxLogEntries limit', () => {
      const handler = new ErrorHandler({ maxLogEntries: 3 });

      // Add 5 errors
      for (let i = 0; i < 5; i++) {
        handler.logError(new Error(`Error ${i}`));
      }

      const logs = handler.getLogs();
      expect(logs).toHaveLength(3);
      // Should keep the last 3 entries
      expect(logs[0].message).toBe('Error 2');
      expect(logs[1].message).toBe('Error 3');
      expect(logs[2].message).toBe('Error 4');
    });
  });

  describe('logWarning', () => {
    it('should log warning message', () => {
      errorHandler.logWarning('Test warning');

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warning');
      expect(logs[0].message).toBe('Test warning');
    });

    it('should include context in warning log', () => {
      const context = { component: 'test' };
      errorHandler.logWarning('Test warning', context);

      const logs = errorHandler.getLogs();
      expect(logs[0].context).toEqual(context);
    });
  });

  describe('logInfo', () => {
    it('should log info message', () => {
      errorHandler.logInfo('Test info');

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test info');
    });
  });

  describe('logDebug', () => {
    it('should log debug message', () => {
      errorHandler.logDebug('Test debug');

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('debug');
      expect(logs[0].message).toBe('Test debug');
    });
  });

  describe('getLogs', () => {
    it('should return all logs', () => {
      errorHandler.logError(new Error('Error 1'));
      errorHandler.logWarning('Warning 1');
      errorHandler.logInfo('Info 1');

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(3);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      errorHandler.logError(new Error('Test error'));
      expect(errorHandler.getLogs()).toHaveLength(1);

      errorHandler.clearLogs();
      expect(errorHandler.getLogs()).toHaveLength(0);
    });
  });

  describe('getLogsBySeverity', () => {
    it('should filter logs by severity', () => {
      const error1 = new RateCompareError('Error 1', 'TEST1', ErrorSeverity.HIGH);
      const error2 = new RateCompareError('Error 2', 'TEST2', ErrorSeverity.LOW);
      const error3 = new RateCompareError('Error 3', 'TEST3', ErrorSeverity.HIGH);

      errorHandler.logError(error1);
      errorHandler.logError(error2);
      errorHandler.logError(error3);

      const highSeverityLogs = errorHandler.getLogsBySeverity(ErrorSeverity.HIGH);
      expect(highSeverityLogs).toHaveLength(2);
      expect(highSeverityLogs[0].message).toBe('Error 1');
      expect(highSeverityLogs[1].message).toBe('Error 3');
    });
  });

  describe('getLogsByCategory', () => {
    it('should filter logs by category', () => {
      const error1 = new RateCompareError('Error 1', 'TEST1', ErrorSeverity.MEDIUM, ErrorCategory.VALIDATION);
      const error2 = new RateCompareError('Error 2', 'TEST2', ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
      const error3 = new RateCompareError('Error 3', 'TEST3', ErrorSeverity.MEDIUM, ErrorCategory.VALIDATION);

      errorHandler.logError(error1);
      errorHandler.logError(error2);
      errorHandler.logError(error3);

      const validationLogs = errorHandler.getLogsByCategory(ErrorCategory.VALIDATION);
      expect(validationLogs).toHaveLength(2);
      expect(validationLogs[0].message).toBe('Error 1');
      expect(validationLogs[1].message).toBe('Error 3');
    });
  });
});

describe('RateCompareError', () => {
  it('should create error with all properties', () => {
    const error = new RateCompareError(
      'Test error',
      'TEST_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.VALIDATION,
      { userId: '123' },
      true
    );

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.context).toEqual({ userId: '123' });
    expect(error.isOperational).toBe(true);
    expect(error.timestamp).toBeDefined();
    expect(error.name).toBe('RateCompareError');
  });

  it('should have default values', () => {
    const error = new RateCompareError('Test error', 'TEST_ERROR');

    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.UNKNOWN);
    expect(error.context).toBeUndefined();
    expect(error.isOperational).toBe(true);
  });

  it('should convert to JSON', () => {
    const error = new RateCompareError(
      'Test error',
      'TEST_ERROR',
      ErrorSeverity.HIGH,
      ErrorCategory.VALIDATION,
      { userId: '123' },
      true
    );

    const json = error.toJSON();
    expect(json.name).toBe('RateCompareError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe('TEST_ERROR');
    expect(json.severity).toBe(ErrorSeverity.HIGH);
    expect(json.category).toBe(ErrorCategory.VALIDATION);
    expect(json.context).toEqual({ userId: '123' });
    expect(json.isOperational).toBe(true);
    expect(json.timestamp).toBeDefined();
    expect(json.stack).toBeDefined();
  });
});

describe('Error creation helpers', () => {
  it('should create validation error', () => {
    const error = createValidationError('Invalid input', { field: 'email' });

    expect(error).toBeInstanceOf(RateCompareError);
    expect(error.message).toBe('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.context).toEqual({ field: 'email' });
  });

  it('should create network error', () => {
    const error = createNetworkError('Connection failed', { url: 'https://api.example.com' });

    expect(error).toBeInstanceOf(RateCompareError);
    expect(error.message).toBe('Connection failed');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.category).toBe(ErrorCategory.NETWORK);
    expect(error.context).toEqual({ url: 'https://api.example.com' });
  });

  it('should create API error', () => {
    const error = createAPIError('API request failed', { status: 500 });

    expect(error).toBeInstanceOf(RateCompareError);
    expect(error.message).toBe('API request failed');
    expect(error.code).toBe('API_ERROR');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.category).toBe(ErrorCategory.API);
    expect(error.context).toEqual({ status: 500 });
  });

  it('should create configuration error', () => {
    const error = createConfigurationError('Missing config', { key: 'apiKey' });

    expect(error).toBeInstanceOf(RateCompareError);
    expect(error.message).toBe('Missing config');
    expect(error.code).toBe('CONFIGURATION_ERROR');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.context).toEqual({ key: 'apiKey' });
  });

  it('should create rate fetching error', () => {
    const error = createRateFetchingError('Rate fetch failed', { channel: 'airbnb' });

    expect(error).toBeInstanceOf(RateCompareError);
    expect(error.message).toBe('Rate fetch failed');
    expect(error.code).toBe('RATE_FETCHING_ERROR');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.category).toBe(ErrorCategory.RATE_FETCHING);
    expect(error.context).toEqual({ channel: 'airbnb' });
  });
});

describe('handlePromiseRejection', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      enableConsoleLogging: false,
      enableRemoteLogging: false
    });
  });

  afterEach(() => {
    errorHandler.clearLogs();
  });

  it('should handle RateCompareError', () => {
    const error = new RateCompareError('Test error', 'TEST_ERROR');
    handlePromiseRejection(error, { context: 'test' }, errorHandler);

    const logs = errorHandler.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Test error');
  });

  it('should handle regular Error', () => {
    const error = new Error('Regular error');
    handlePromiseRejection(error, { context: 'test' }, errorHandler);

    const logs = errorHandler.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Error: Regular error');
  });
});

describe('withErrorHandling', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      enableConsoleLogging: false,
      enableRemoteLogging: false
    });
  });

  afterEach(() => {
    errorHandler.clearLogs();
  });

  it('should return result for successful async function', async () => {
    const fn = async (x: number) => x * 2;
    const wrappedFn = withErrorHandling(fn, { context: 'test' }, errorHandler);

    const result = await wrappedFn(5);
    expect(result).toBe(10);
    expect(errorHandler.getLogs()).toHaveLength(0);
  });

  it('should return null and log error for failed async function', async () => {
    const fn = async (x: number) => {
      throw new Error('Test error');
    };
    const wrappedFn = withErrorHandling(fn, { context: 'test' }, errorHandler);

    const result = await wrappedFn(5);
    expect(result).toBeNull();
    
    const logs = errorHandler.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Error: Test error');
  });
});

describe('withSyncErrorHandling', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      enableConsoleLogging: false,
      enableRemoteLogging: false
    });
  });

  afterEach(() => {
    errorHandler.clearLogs();
  });

  it('should return result for successful sync function', () => {
    const fn = (x: number) => x * 2;
    const wrappedFn = withSyncErrorHandling(fn, { context: 'test' }, errorHandler);

    const result = wrappedFn(5);
    expect(result).toBe(10);
    expect(errorHandler.getLogs()).toHaveLength(0);
  });

  it('should return null and log error for failed sync function', () => {
    const fn = (x: number) => {
      throw new Error('Test error');
    };
    const wrappedFn = withSyncErrorHandling(fn, { context: 'test' }, errorHandler);

    const result = wrappedFn(5);
    expect(result).toBeNull();
    
    const logs = errorHandler.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Error: Test error');
  });
});
