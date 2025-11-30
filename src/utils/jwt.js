import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// JWT Token generieren
export function generateToken(userId, email, role) {
  const payload = {
    userId,
    email,
    role,
  };

  // Token mit 7 Tagen Gültigkeit
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

// JWT Token verifizieren
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Token aus Authorization Header extrahieren
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
