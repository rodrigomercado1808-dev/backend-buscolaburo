import { auth, db } from '../config/firebase.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token faltante.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error detallado al verificar token:', {
      code: error.code,
      message: error.message,
      // No logueamos el token completo por seguridad, pero sí su existencia
      hasToken: !!idToken
    });

    let userMessage = 'Token inválido o expirado.';
    if (error.code === 'auth/id-token-expired') {
      userMessage = 'La sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error.code === 'auth/argument-error') {
      userMessage = 'Error en el formato del token de autenticación.';
    }

    return res.status(401).json({ error: userMessage, details: error.code });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar rol de admin:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
