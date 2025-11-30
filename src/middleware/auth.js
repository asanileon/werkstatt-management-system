import { verifyToken, extractToken } from '../utils/jwt.js';

// Middleware zum Prüfen der Authentifizierung
export function checkAuth(req) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return { authenticated: false, error: 'Kein Token vorhanden' };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return { authenticated: false, error: 'Ungültiges Token' };
  }

  // User-Daten an Request anhängen
  req.user = decoded;
  return { authenticated: true, user: decoded };
}

// Middleware zum Prüfen der Rolle
export function checkRole(req, allowedRoles = []) {
  const authResult = checkAuth(req);

  if (!authResult.authenticated) {
    return authResult;
  }

  const userRole = req.user.role;

  // Wenn keine Rollen angegeben, nur Authentifizierung prüfen
  if (allowedRoles.length === 0) {
    return authResult;
  }

  // Rolle prüfen
  if (!allowedRoles.includes(userRole)) {
    return {
      authenticated: true,
      authorized: false,
      error: 'Keine Berechtigung für diese Aktion',
    };
  }

  return { authenticated: true, authorized: true, user: req.user };
}

// Helper: API Handler mit Auth wrappen
export function withAuth(handler, allowedRoles = []) {
  return async (req, res) => {
    const authCheck = checkRole(req, allowedRoles);

    if (!authCheck.authenticated) {
      return res.status(401).json({ error: authCheck.error });
    }

    if (allowedRoles.length > 0 && !authCheck.authorized) {
      return res.status(403).json({ error: authCheck.error });
    }

    return handler(req, res);
  };
}
