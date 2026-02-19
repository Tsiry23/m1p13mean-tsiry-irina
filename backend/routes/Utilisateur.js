const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');

router.get('/init', async (req, res) => {
  try {

    // récupérer les rôles
    const roleAdminCC = await Role.findOne({ nom: "admin du centre commercial" });
    const roleAdminBoutique = await Role.findOne({ nom: "admin de boutique" });
    const roleClient = await Role.findOne({ nom: "client" });

    if (!roleAdminCC || !roleAdminBoutique || !roleClient) {
      return res.status(400).json({
        success: false,
        message: "Les rôles doivent être initialisés avant"
      });
    }

    const usersAcreer = [
      {
        nom: "Admin",
        prenom: "Centre",
        email: "m1p13meantsiryirina.admin@gmail.com",
        mdp: "admin123",
        role: roleAdminCC._id
      },
      {
        nom: "Admin",
        prenom: "Boutique",
        email: "m1p13meantsiryirina.admin.boutique@gmail.com",
        mdp: "adminboutique123",
        role: roleAdminBoutique._id
      },
      {
        nom: "Client",
        prenom: "One",
        email: "m1p13meantsiryirina.client1@gmail.com",
        mdp: "client123",
        role: roleClient._id
      }
    ];

    const crees = [];
    const existants = [];

    for (const user of usersAcreer) {

      const deja = await Utilisateur.findOne({ email: user.email });

      if (deja) {
        existants.push(user.email);
        continue;
      }

      const hash = await bcrypt.hash(user.mdp, 10);

      const newUser = new Utilisateur({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        mdp: hash,
        id_role: user.role
      });

      await newUser.save();
      crees.push(user.email);
    }

    res.json({
      success: true,
      crees,
      existants
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur init users"
    });
  }
});

// -----------------------------------------------------------------------------
// GET /utilisateurs
// Récupère la liste de tous les utilisateurs (sans les mots de passe)
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // On exclut le champ mdp de la réponse
    const utilisateurs = await Utilisateur.find()
      .select('-mdp')           // exclut le mot de passe
      .populate('id_boutique', 'nom')   // optionnel : nom de la boutique
      .populate('id_role', 'nom');      // optionnel : nom du rôle

    res.json({
      success: true,
      count: utilisateurs.length,
      data: utilisateurs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

// -----------------------------------------------------------------------------
// POST /utilisateurs
// Crée un nouvel utilisateur (avec hashage du mot de passe)
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, mdp, id_boutique, id_role } = req.body;

    // 1. Validation minimale des champs obligatoires
    if (!nom || !prenom || !email || !mdp || !id_role) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, prénom, email, mot de passe et id_role sont obligatoires'
      });
    }

    // 2. Vérifier si l'email existe déjà
    const emailExist = await Utilisateur.findOne({ email: email.toLowerCase() });
    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // 3. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const mdpHashe = await bcrypt.hash(mdp, salt);

    // 4. Créer le nouvel utilisateur
    const nouvelUtilisateur = new Utilisateur({
      nom,
      prenom,
      email: email.toLowerCase(),
      mdp: mdpHashe,
      id_boutique: id_boutique || null, // peut être null si pas obligatoire
      id_role
    });

    // 5. Sauvegarde
    const utilisateurCree = await nouvelUtilisateur.save();

    // 6. Réponse (sans renvoyer le mot de passe)
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        _id: utilisateurCree._id,
        nom: utilisateurCree.nom,
        prenom: utilisateurCree.prenom,
        email: utilisateurCree.email,
        id_boutique: utilisateurCree.id_boutique,
        id_role: utilisateurCree.id_role,
        createdAt: utilisateurCree.createdAt
      }
    });
  } catch (error) {
    console.error(error);

    // Gestion d'erreur Mongoose (ex: validation)
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

module.exports = router;