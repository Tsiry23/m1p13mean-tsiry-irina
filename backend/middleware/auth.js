const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SUPER_SECRET_KEY;

const authMiddleware = (req, res, next) => {
  // Récupère le header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou mal formé' });
  }

  // Extrait juste le token (après "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Vérifie et décode
    const decoded = jwt.verify(token, SECRET);

    // On attache les infos décodées à req.user
    req.user = decoded;   // → { id: "...", role: "admin" ou "user", ... }

    next(); // tout est OK → passe à la route
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;