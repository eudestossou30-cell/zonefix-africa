import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-only-secret';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    secret(),
    { expiresIn: '7d' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  try {
    req.auth = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  };
}
