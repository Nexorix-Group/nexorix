/**
 * Auth Plugin — standalone version
 * Copy to your project: src/core/plugins/auth/index.js
 * Or run: nexorix add auth
 */

export function generateToken(payload, secret = 'nexorix-secret', expiresInSeconds = 604800) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  })).toString('base64url');
  const signature = Buffer.from(`${header}.${body}.${secret}`).toString('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
    return payload;
  } catch (err) {
    throw new Error(`Token invalid: ${err.message}`);
  }
}

export function authMiddleware(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized — missing or invalid Authorization header' }));
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    return true;
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Unauthorized — ${err.message}` }));
    return false;
  }
}
