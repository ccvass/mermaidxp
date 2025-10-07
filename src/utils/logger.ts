/**
 * Professional Logging System for FASE 0.7
 * Structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private logBuffer: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemote: false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.loadStoredLogs();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredLogs(): void {
    if (!this.config.enableStorage) return;

    try {
      const stored = localStorage.getItem('mermaidxp_logs');
      if (stored) {
        this.logBuffer = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  private saveLogsToStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      // Keep only the most recent entries
      const recentLogs = this.logBuffer.slice(-this.config.maxStorageEntries);
      localStorage.setItem('mermaidxp_logs', JSON.stringify(recentLogs));
      this.logBuffer = recentLogs;
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      sessionId: this.sessionId,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    return `${entry.timestamp} ${levelName} ${contextStr} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const message = this.formatConsoleMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.data, entry.error);
        break;
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, data, error);

    // Add to buffer
    this.logBuffer.push(entry);

    // Log to console
    this.logToConsole(entry);

    // Save to storage
    this.saveLogsToStorage();

    // Send to remote (async)
    if (this.config.enableRemote) {
      this.logToRemote(entry).catch(() => {
        // Silently fail for remote logging
      });
    }
  }

  // Public logging methods
  debug(_message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, _message, context, data);
  }

  info(_message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, _message, context, data);
  }

  warn(_message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, _message, context, data);
  }

  error(_message: string, context?: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, _message, context, data, error);
  }

  fatal(_message: string, context?: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.FATAL, _message, context, data, error);
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logBuffer.filter((entry) => entry.level >= level);
    }
    return [...this.logBuffer];
  }

  clearLogs(): void {
    this.logBuffer = [];
    if (this.config.enableStorage) {
      localStorage.removeItem('mermaidxp_logs');
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  // Context-specific loggers
  canvas(_message: string, data?: unknown): Logger {
    return {
      debug: (msg: string, d?: unknown) => this.debug(msg, 'canvas', d || data),
      info: (msg: string, d?: unknown) => this.info(msg, 'canvas', d || data),
      warn: (msg: string, d?: unknown) => this.warn(msg, 'canvas', d || data),
      error: (msg: string, error?: Error, d?: unknown) => this.error(msg, 'canvas', error, d || data),
      fatal: (msg: string, error?: Error, d?: unknown) => this.fatal(msg, 'canvas', error, d || data),
    } as Logger;
  }

  drag(_message: string, data?: unknown): Logger {
    return {
      debug: (msg: string, d?: unknown) => this.debug(msg, 'drag-drop', d || data),
      info: (msg: string, d?: unknown) => this.info(msg, 'drag-drop', d || data),
      warn: (msg: string, d?: unknown) => this.warn(msg, 'drag-drop', d || data),
      error: (msg: string, error?: Error, d?: unknown) => this.error(msg, 'drag-drop', error, d || data),
      fatal: (msg: string, error?: Error, d?: unknown) => this.fatal(msg, 'drag-drop', error, d || data),
    } as Logger;
  }

  mermaid(_message: string, data?: unknown): Logger {
    return {
      debug: (msg: string, d?: unknown) => this.debug(msg, 'mermaid', d || data),
      info: (msg: string, d?: unknown) => this.info(msg, 'mermaid', d || data),
      warn: (msg: string, d?: unknown) => this.warn(msg, 'mermaid', d || data),
      error: (msg: string, error?: Error, d?: unknown) => this.error(msg, 'mermaid', error, d || data),
      fatal: (msg: string, error?: Error, d?: unknown) => this.fatal(msg, 'mermaid', error, d || data),
    } as Logger;
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export for testing and configuration
export { Logger };
