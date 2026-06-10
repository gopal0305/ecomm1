import jwt from 'jsonwebtoken';

function toRoles(claim) {
  if (!claim) return [];
  if (Array.isArray(claim)) return claim;
  if (typeof claim === 'string') return [claim];
  return [];
}

export function createJwtAuthMiddleware({ secret, issuer }) {
  if (!secret) throw new Error('JWT secret missing');

  function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') return res.status(401).json({ message: 'Missing Authorization header' });
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid Authorization header' });

    try {
      const decoded = jwt.verify(token, secret, { issuer: issuer || undefined });
      req.user = {
        id: decoded.sub ? Number(decoded.sub) : undefined,
        email: decoded.email,
        roles: toRoles(decoded.roles || decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']),
      };
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    next();
  }

  function requireAdmin(req, res, next) {
    const roles = req.user?.roles || [];
    const hasAdmin = roles.some(r => String(r).toUpperCase() === 'ADMIN' || String(r).toUpperCase() === 'ROLE_ADMIN');
    if (!hasAdmin) return res.status(403).json({ message: 'Forbidden' });
    next();
  }

  return { auth, requireAuth, requireAdmin };
}

