// Production logging utility

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.minLevel = this.isDevelopment ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private createEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const { timestamp, level, message, data, context } = entry;
    const prefix = context ? `[${context}]` : '';
    const logMessage = `${timestamp} ${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      case 'info':
        console.info(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');

        // In production, send errors to tracking service
        if (!this.isDevelopment && typeof window !== 'undefined') {
          // Example integration with error tracking
          // window.Sentry?.captureException(new Error(message), { extra: data });
        }
        break;
    }

    // Store in localStorage for debugging (last 100 entries)
    if (typeof window !== 'undefined') {
      this.storeLog(entry);
    }
  }

  private storeLog(entry: LogEntry): void {
    try {
      const key = 'app_logs';
      const stored = localStorage.getItem(key);
      const logs: LogEntry[] = stored ? JSON.parse(stored) : [];

      logs.push(entry);

      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(this.createEntry('debug', message, data, context));
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(this.createEntry('info', message, data, context));
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(this.createEntry('warn', message, data, context));
  }

  error(message: string, error?: unknown, context?: string): void {
    this.log(this.createEntry('error', message, error, context));
  }

  // API call logging helpers
  apiRequest(endpoint: string, method: string = 'GET'): void {
    this.debug(`API ${method} ${endpoint}`, undefined, 'API');
  }

  apiResponse(endpoint: string, status: number, duration?: number): void {
    const message = `API response ${endpoint} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    if (status >= 400) {
      this.error(message, undefined, 'API');
    } else {
      this.debug(message, undefined, 'API');
    }
  }

  apiError(endpoint: string, error: unknown): void {
    this.error(`API error ${endpoint}`, error, 'API');
  }

  // User action logging
  userAction(action: string, details?: unknown): void {
    this.info(`User: ${action}`, details, 'USER');
  }

  // Performance logging
  performance(metric: string, value: number): void {
    this.debug(`Performance: ${metric} = ${value}ms`, undefined, 'PERF');
  }

  // Get stored logs for debugging
  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch {
      // Silently fail
    }
  }

  // Export logs for debugging
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility functions
export function logApiCall(endpoint: string, fn: () => Promise<unknown>): Promise<unknown> {
  const start = Date.now();
  logger.apiRequest(endpoint);

  return fn()
    .then(response => {
      const duration = Date.now() - start;
      logger.apiResponse(endpoint, 200, duration);
      return response;
    })
    .catch(error => {
      const duration = Date.now() - start;
      logger.apiError(endpoint, error);
      logger.apiResponse(endpoint, 500, duration);
      throw error;
    });
}
