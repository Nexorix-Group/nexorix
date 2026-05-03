/**
 * Logger Plugin — Structured logging (replaces console.log)
 * Copy to your project: src/core/plugins/logger/index.js
 * Or run: nexorix add logger
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const ENV_LEVEL = process.env.LOG_LEVEL?.toLowerCase();
const currentLevel = LEVELS[ENV_LEVEL] ?? LEVELS.info;

const COLORS = {
  debug: '\x1b[36m',  // cyan
  info:  '\x1b[32m',  // green
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  reset: '\x1b[0m',
};

function format(level, message, meta = {}) {
  const ts = new Date().toISOString();
  const hasMeta = Object.keys(meta).length > 0;

  if (process.env.LOG_FORMAT === 'json') {
    return JSON.stringify({
      timestamp: ts,
      level,
      message,
      ...(hasMeta ? { meta } : {}),
    });
  }

  const color = COLORS[level] || '';
  const reset = COLORS.reset;
  const metaStr = hasMeta ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${level.toUpperCase()}]${reset} ${ts} — ${message}${metaStr}`;
}

export const logger = {
  debug(message, meta = {}) {
    if (currentLevel <= LEVELS.debug) {
      process.stdout.write(format('debug', message, meta) + '\n');
    }
  },

  info(message, meta = {}) {
    if (currentLevel <= LEVELS.info) {
      process.stdout.write(format('info', message, meta) + '\n');
    }
  },

  warn(message, meta = {}) {
    if (currentLevel <= LEVELS.warn) {
      process.stderr.write(format('warn', message, meta) + '\n');
    }
  },

  error(message, meta = {}) {
    if (currentLevel <= LEVELS.error) {
      process.stderr.write(format('error', message, meta) + '\n');
    }
  },

  /**
   * HTTP request logger middleware helper
   */
  request(req, statusCode, durationMs) {
    this.info(`${req.method} ${req.url} ${statusCode}`, { duration: `${durationMs}ms` });
  },
};
