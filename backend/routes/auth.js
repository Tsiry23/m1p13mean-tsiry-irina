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

module.exports = router;