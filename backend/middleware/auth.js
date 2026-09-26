import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_industrial_loto_secret_key_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      name: user.name,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, check if x-demo-user-id header is provided for quick hackathon testing
    const demoUserId = req.headers['x-demo-user-id'];
    const demoRole = req.headers['x-demo-role'];
    if (demoUserId && demoRole) {
      req.user = {
        userId: demoUserId,
        role: demoRole.toUpperCase(),
        name: `Demo ${demoRole}`
      };
      return next();
    }
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Access token or demo headers required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'INVALID_TOKEN', message: 'Token is expired or invalid.' });
    }
    req.user = decoded;
    next();
  });
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User role context missing.' });
    }

    if (req.user.role === 'ADMIN') {
      return next(); // Admin has universal access
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'FORBIDDEN_ROLE', 
        message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Active role: '${req.user.role}'` 
      });
    }

    next();
  };
}
