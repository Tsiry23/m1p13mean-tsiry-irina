const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const Role = require('../models/Role');
const Boutique = require('../models/Boutique');

router.get('/init', async (req, res) => {
  try {

    const roleAdminCC = await Role.findOne({ nom: "admin du centre commercial" });
    const roleAdminBoutique = await Role.findOne({ nom: "admin de boutique" });
    const roleClient = await Role.findOne({ nom: "client" });

    if (!roleAdminCC || !roleAdminBoutique || !roleClient) {
      return res.status(400).json({
        success: false,
        message: "Les rôles doivent être initialisés avant"
      });
    }

    const crees = [];
    const existants = [];

    // =========================
    // 1️⃣ ADMIN CENTRE
    // =========================
    const adminCentreEmail = "m1p13meantsiryirina.admin@gmail.com";

    const adminCentreExiste = await Utilisateur.findOne({ email: adminCentreEmail });

    if (!adminCentreExiste) {
      const hash = await bcrypt.hash("admin123", 10);

      await Utilisateur.create({
        nom: "Admin",
        prenom: "Centre",
        email: adminCentreEmail,
        mdp: hash,
        id_role: roleAdminCC._id
      });

      crees.push(adminCentreEmail);
    } else {
      existants.push(adminCentreEmail);
    }

    // =========================
    // 2️⃣ CLIENT
    // =========================
    const clientEmail = "m1p13meantsiryirina.client1@gmail.com";

    const clientExiste = await Utilisateur.findOne({ email: clientEmail });

    if (!clientExiste) {
      const hash = await bcrypt.hash("client123", 10);

      await Utilisateur.create({
        nom: "Client",
        prenom: "One",
        email: clientEmail,
        mdp: hash,
        id_role: roleClient._id
      });

      crees.push(clientEmail);
    } else {
      existants.push(clientEmail);
    }

    // =========================
    // 3️⃣ ADMIN PAR BOUTIQUE
    // =========================
    const boutiques = await Boutique.find();

    let index = 1;

    for (const boutique of boutiques) {

      const email = `m1p13meantsiryirina.admin.boutique${index}@gmail.com`;

      const existe = await Utilisateur.findOne({ email });

      if (!existe) {

        const hash = await bcrypt.hash("adminboutique123", 10);

        await Utilisateur.create({
          nom: "Admin",
          prenom: boutique.nom,
          email: email,
          mdp: hash,
          id_role: roleAdminBoutique._id,
          id_boutique: boutique._id
        });

        crees.push(email);

      } else {
        existants.push(email);
      }

      index++;
    }

    res.json({
      success: true,
      crees,
      existants,
      totalBoutiques: boutiques.length
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
router.post('/inscription', async (req, res) => {
  try {
    const { nom, prenom, email, mdp } = req.body;

    const roleClient = await Role.findOne({ nom: "client" });
    const id_role = roleClient._id
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