import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { envConfig } from './env.config';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console output (human-readable)
const consoleFormat = printf((info) => {
  const ts = String(info.timestamp);
  const ctx = info.context as string | undefined;
  const trace = info.trace as string | undefined;

  let log = `${ts} [${info.level}]`;
  if (ctx) log += ` [${ctx}]`;
  log += ` ${String(info.message)}`;
  if (trace) log += `\n${trace}`;
  return log;
});

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console transport - human-readable format
    new winston.transports.Console({
      level: envConfig.LOG_LEVEL || 'debug',
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat,
      ),
    }),

    // Daily rotate file - all logs (JSON format for parsing/aggregation)
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: envConfig.LOG_LEVEL || 'info',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
    }),

    // Daily rotate file - errors only
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
    }),
  ],
};
