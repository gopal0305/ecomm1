import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function issueToken({ secret, issuer, user }) {
  const roles = user.roles || [];
  return jwt.sign(
    {
      email: user.email,
      roles,
    },
    secret,
    {
      issuer: issuer || undefined,
      subject: String(user.id),
      expiresIn: process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ? Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS) : 3600,
    }
  );
}

export function authRoutes({ pool }) {
  const router = express.Router();

  router.post('/register', async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: 'email and password required' });

      const pwHash = await bcrypt.hash(String(password), 10);

      const userRoleRows = await pool.query('SELECT id, name FROM roles WHERE name = $1', ['USER']);
      const roleId = userRoleRows.rows[0]?.id;

      const userRows = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, pwHash]
      );
      const user = userRows.rows[0];

      if (roleId) {
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, roleId]);
      }

      const rolesRows = await pool.query(
        'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1',
        [user.id]
      );

      const token = issueToken({
        secret: process.env.JWT_SECRET || 'change-this-secret-to-a-long-random-string',
        issuer: process.env.JWT_ISSUER || 'ecomm',
        user: { id: user.id, email: user.email, roles: rolesRows.rows.map(r => r.name) },
      });

      return res.json({ token });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: 'email and password required' });

      const userRows = await pool.query('SELECT id, email, password_hash, enabled FROM users WHERE email = $1', [email]);
      const user = userRows.rows[0];
      if (!user || !user.enabled) return res.status(401).json({ message: 'Invalid credentials' });

      const ok = await bcrypt.compare(String(password), user.password_hash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const rolesRows = await pool.query(
        'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1',
        [user.id]
      );

      const token = issueToken({
        secret: process.env.JWT_SECRET || 'change-this-secret-to-a-long-random-string',
        issuer: process.env.JWT_ISSUER || 'ecomm',
        user: { id: user.id, email: user.email, roles: rolesRows.rows.map(r => r.name) },
      });

      return res.json({ token });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

