import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function installPlugin(plugin) {
  const cwd = process.cwd();
  const srcPath = path.join(cwd, 'src');

  if (!(await fs.pathExists(srcPath))) {
    console.log(chalk.red('  ✖ src/ directory not found.'));
    console.log(chalk.gray('  Make sure you are inside a Nexorix project.'));
    console.log('');
    process.exit(1);
  }

  console.log(chalk.gray(`  Installing plugin: ${chalk.white(plugin)}...`));

  switch (plugin) {
    case 'auth':
      await installAuth(cwd);
      break;
    case 'mysql':
      await installMysql(cwd);
      break;
    case 'cache':
      await installCache(cwd);
      break;
    case 'logger':
      await installLogger(cwd);
      break;
  }
}

async function installAuth(cwd) {
  const pluginPath = path.join(cwd, 'src', 'core', 'plugins', 'auth');
  await fs.ensureDir(pluginPath);

  const content = `import { config } from '../../../config/env.js';

/**
 * Auth Plugin — JWT token generation and validation
 * For production: npm install jsonwebtoken
 */

export function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  })).toString('base64url');
  const signature = Buffer.from(\`\${header}.\${body}.\${config.jwt.secret}\`).toString('base64url');
  return \`\${header}.\${body}.\${signature}\`;
}

export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
    return payload;
  } catch (err) {
    throw new Error(\`Token invalid: \${err.message}\`);
  }
}

export function authMiddleware(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized — missing token' }));
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    return true;
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: \`Unauthorized — \${err.message}\` }));
    return false;
  }
}
`;

  await fs.writeFile(path.join(pluginPath, 'index.js'), content);

  console.log(chalk.green('  ✔ Plugin installed: auth'));
  console.log('');
  console.log(chalk.gray('  File created:'));
  console.log(chalk.cyan('    src/core/plugins/auth/index.js'));
  console.log('');
  console.log(chalk.gray('  Usage:'));
  console.log(chalk.yellow("    import { authMiddleware, generateToken } from './core/plugins/auth/index.js';"));
  console.log('');
}

async function installMysql(cwd) {
  const pluginPath = path.join(cwd, 'src', 'core', 'database');
  await fs.ensureDir(pluginPath);

  const content = `// Requires: npm install mysql2
import mysql from 'mysql2/promise';

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexorix_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('[mysql] Connection pool created');
  }
  return pool;
}

export async function query(sql, params = []) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function transaction(fn) {
  const p = await getPool();
  const conn = await p.getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
`;

  await fs.writeFile(path.join(pluginPath, 'connection.js'), content);

  console.log(chalk.green('  ✔ Plugin installed: mysql'));
  console.log('');
  console.log(chalk.gray('  File created:'));
  console.log(chalk.cyan('    src/core/database/connection.js'));
  console.log('');
  console.log(chalk.yellow('  ⚠ Run: npm install mysql2'));
  console.log('');
  console.log(chalk.gray('  Add to .env:'));
  console.log(chalk.yellow('    DB_HOST=localhost'));
  console.log(chalk.yellow('    DB_USER=root'));
  console.log(chalk.yellow('    DB_PASSWORD='));
  console.log(chalk.yellow('    DB_NAME=nexorix_db'));
  console.log('');
}

async function installCache(cwd) {
  const pluginPath = path.join(cwd, 'src', 'core', 'plugins', 'cache');
  await fs.ensureDir(pluginPath);

  const content = `/**
 * Cache Plugin — In-memory cache with TTL support
 */

const store = new Map();
const ttlStore = new Map();

export const cache = {
  set(key, value, ttlSeconds = 300) {
    store.set(key, value);
    if (ttlSeconds > 0) {
      const existing = ttlStore.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        store.delete(key);
        ttlStore.delete(key);
      }, ttlSeconds * 1000);
      ttlStore.set(key, timer);
    }
  },

  get(key) {
    return store.get(key) ?? null;
  },

  has(key) {
    return store.has(key);
  },

  delete(key) {
    const timer = ttlStore.get(key);
    if (timer) clearTimeout(timer);
    store.delete(key);
    ttlStore.delete(key);
  },

  clear() {
    for (const timer of ttlStore.values()) clearTimeout(timer);
    store.clear();
    ttlStore.clear();
  },

  size() {
    return store.size;
  },

  stats() {
    return { size: store.size, keys: [...store.keys()] };
  },
};
`;

  await fs.writeFile(path.join(pluginPath, 'index.js'), content);

  console.log(chalk.green('  ✔ Plugin installed: cache'));
  console.log('');
  console.log(chalk.gray('  File created:'));
  console.log(chalk.cyan('    src/core/plugins/cache/index.js'));
  console.log('');
  console.log(chalk.gray('  Usage:'));
  console.log(chalk.yellow("    import { cache } from './core/plugins/cache/index.js';"));
  console.log(chalk.yellow("    cache.set('key', value, 60); // TTL: 60s"));
  console.log(chalk.yellow("    cache.get('key');"));
  console.log('');
}

async function installLogger(cwd) {
  const pluginPath = path.join(cwd, 'src', 'core', 'plugins', 'logger');
  await fs.ensureDir(pluginPath);

  const content = `/**
 * Logger Plugin — Structured logging (replaces console.log)
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function format(level, message, meta = {}) {
  const ts = new Date().toISOString();
  const hasMeta = Object.keys(meta).length > 0;
  return JSON.stringify({
    timestamp: ts,
    level,
    message,
    ...(hasMeta ? { meta } : {}),
  });
}

export const logger = {
  debug(message, meta = {}) {
    if (currentLevel <= LEVELS.debug) {
      process.stdout.write(format('debug', message, meta) + '\\n');
    }
  },

  info(message, meta = {}) {
    if (currentLevel <= LEVELS.info) {
      process.stdout.write(format('info', message, meta) + '\\n');
    }
  },

  warn(message, meta = {}) {
    if (currentLevel <= LEVELS.warn) {
      process.stderr.write(format('warn', message, meta) + '\\n');
    }
  },

  error(message, meta = {}) {
    if (currentLevel <= LEVELS.error) {
      process.stderr.write(format('error', message, meta) + '\\n');
    }
  },
};
`;

  await fs.writeFile(path.join(pluginPath, 'index.js'), content);

  console.log(chalk.green('  ✔ Plugin installed: logger'));
  console.log('');
  console.log(chalk.gray('  File created:'));
  console.log(chalk.cyan('    src/core/plugins/logger/index.js'));
  console.log('');
  console.log(chalk.gray('  Usage:'));
  console.log(chalk.yellow("    import { logger } from './core/plugins/logger/index.js';"));
  console.log(chalk.yellow("    logger.info('Server started', { port: 3000 });"));
  console.log(chalk.yellow("    logger.error('Something failed', { err: error.message });"));
  console.log('');
}
