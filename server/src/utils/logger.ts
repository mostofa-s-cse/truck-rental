import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Filter out circular references and sensitive data
    const safeMeta = Object.keys(meta).reduce((acc, key) => {
      if (key !== 'req' && key !== 'res' && key !== 'socket') {
        try {
          acc[key] = meta[key];
        } catch (e) {
          acc[key] = '[Circular Reference]';
        }
      }
      return acc;
    }, {} as any);
    
    return `${timestamp} [${level}]: ${message} ${Object.keys(safeMeta).length ? JSON.stringify(safeMeta, null, 2) : ''}`;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'truck-rental-api' },
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // Combined logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // API access logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // Database logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'database-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // Payment logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'payment-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // Authentication logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'auth-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Specialized loggers for different components
export const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

export const dbLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'database' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'database-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

export const paymentLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'payment' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'payment-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

export const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'authentication' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'auth-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

// Helper functions for structured logging
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId || 'anonymous'
    };

    if (res.statusCode >= 400) {
      apiLogger.error('API Request Error', logData);
    } else {
      apiLogger.info('API Request', logData);
    }
  });

  next();
};

export const logError = (error: any, context?: any) => {
  // Sanitize context to remove circular references
  let sanitizedContext = context;
  if (context && typeof context === 'object') {
    sanitizedContext = {
      method: context.method,
      url: context.url,
      ip: context.ip,
      userId: context.user?.userId,
      // Add other safe properties as needed
    };
  }

  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    context: sanitizedContext
  });
};

export const logDatabase = (operation: string, table: string, data?: any) => {
  dbLogger.info('Database Operation', {
    operation,
    table,
    data: data ? JSON.stringify(data) : undefined
  });
};

export const logPayment = (operation: string, paymentId: string, data?: any) => {
  paymentLogger.info('Payment Operation', {
    operation,
    paymentId,
    data: data ? JSON.stringify(data) : undefined
  });
};

export const logAuth = (operation: string, userId: string, data?: any) => {
  authLogger.info('Authentication Operation', {
    operation,
    userId,
    data: data ? JSON.stringify(data) : undefined
  });
};

export default logger; 