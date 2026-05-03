/**
 * MySQL Plugin — standalone version
 * Copy to your project: src/core/database/connection.js
 * Or run: nexorix add mysql
 * Requires: npm install mysql2
 */

// import mysql from 'mysql2/promise';

let pool = null;

export async function getPool(config = {}) {
  if (!pool) {
    const mysql = await import('mysql2/promise');
    pool = mysql.default.createPool({
      host: config.host || process.env.DB_HOST || 'localhost',
      port: config.port || parseInt(process.env.DB_PORT || '3306', 10),
      user: config.user || process.env.DB_USER || 'root',
      password: config.password || process.env.DB_PASSWORD || '',
      database: config.database || process.env.DB_NAME || 'nexorix_db',
      waitForConnections: true,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: 0,
    });
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

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[mysql] Connection pool closed');
  }
}
