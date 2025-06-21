type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: number;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, userId, requestId } = entry;
    
    if (this.isDevelopment) {
      // Pretty format for development
      let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      if (userId) output += ` (User: ${userId})`;
      if (requestId) output += ` (Request: ${requestId})`;
      if (context) output += `\nContext: ${JSON.stringify(context, null, 2)}`;
      return output;
    }
    
    // JSON format for production (structured logging)
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: number, requestId?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to external service
    if (this.isProduction && level === 'error') {
      // TODO: Send to external logging service (e.g., Sentry, LogRocket, etc.)
    }
  }

  debug(message: string, context?: Record<string, any>, userId?: number, requestId?: string) {
    this.log('debug', message, context, userId, requestId);
  }

  info(message: string, context?: Record<string, any>, userId?: number, requestId?: string) {
    this.log('info', message, context, userId, requestId);
  }

  warn(message: string, context?: Record<string, any>, userId?: number, requestId?: string) {
    this.log('warn', message, context, userId, requestId);
  }

  error(message: string, context?: Record<string, any>, userId?: number, requestId?: string) {
    this.log('error', message, context, userId, requestId);
  }

  // Audit logging for sensitive operations
  audit(action: string, userId: number, details?: Record<string, any>, requestId?: string) {
    this.info(`AUDIT: ${action}`, {
      action,
      userId,
      ...details,
      audit: true,
    }, userId, requestId);
  }

  // Security event logging
  security(event: string, details?: Record<string, any>, requestId?: string) {
    this.warn(`SECURITY: ${event}`, {
      event,
      ...details,
      security: true,
    }, undefined, requestId);
  }
}

export const logger = new Logger();

// Helper to generate request IDs
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Middleware helper to add request ID to headers
export function addRequestId(headers: Headers): string {
  const requestId = generateRequestId();
  headers.set('X-Request-ID', requestId);
  return requestId;
} 