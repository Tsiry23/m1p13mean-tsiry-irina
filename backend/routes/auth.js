const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
require('dotenv').config();

const SECRET = process.env.SUPER_SECRET_KEY;

router.post('/login', async (req, res) => {
  try {
    const { email, mdp } = req.body;
    
    const user = await Utilisateur.findOne({ email }).select('+mdp').populate('id_role', 'nom');
    
    if (!user) {
      return res.status(401).json({ message: "Email invalide" });
    }
    
    const isMatch = await bcrypt.compare(mdp, user.mdp);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe invalide" });
    }
    
    const token = jwt.sign(
      {
        id: user._id,
        role: user.id_role.nom
      },
      SECRET,
      { expiresIn: "24h" }
    );
    let rep = {
      success: true,
      token
    };

    if (user.id_role.nom === 'client') {
      rep.client = token;
    }
    res.json(rep);

  } catch (err) {
    res.status(500).json({ message: "Erreur login" });
  }
});

router.get('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou mal formé' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, SECRET);

    // decoded contient ce que tu as mis dans jwt.sign
    // ici : { id, role, iat, exp }

    return res.status(200).json({
      valid: true,
      role: decoded.role
    });

  } catch (error) {
    return res.status(401).json({
      valid: false,
      message: 'Token invalide ou expiré'
    });
  }
});

module.exports = router;