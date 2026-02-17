const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

router.post('/initier', async (req, res) => {
  try {
    const rolesAInitialiser = [
      "admin du centre commercial",
      "admin de boutique",
      "client"
    ];

    const rolesCrees = [];
    const rolesDejaExistants = [];

    // On traite chaque rôle un par un
    for (const nomOriginal of rolesAInitialiser) {
      const nomNormalise = nomOriginal.trim().toLowerCase();

      // Vérifier si le rôle existe déjà (insensible à la casse)
      const existe = await Role.findOne({ nom: nomNormalise });

      if (existe) {
        rolesDejaExistants.push(existe.nom);
        continue; // on passe au suivant
      }

      // Création du nouveau rôle
      const nouveauRole = new Role({
        nom: nomNormalise   // stocké en minuscule pour cohérence + unicité
      });

      const roleCree = await nouveauRole.save();
      rolesCrees.push(roleCree.nom);
    }

    // Réponse finale selon ce qui s'est passé
    if (rolesCrees.length === 0 && rolesDejaExistants.length === 0) {
      return res.json({
        success: true,
        message: "Aucun rôle à initialiser (liste vide)"
      });
    }

    const message = rolesCrees.length > 0
      ? `${rolesCrees.length} rôle(s) créé(s) avec succès`
      : "Tous les rôles existaient déjà";

    res.status(rolesCrees.length > 0 ? 201 : 200).json({
      success: true,
      message,
      details: {
        crees: rolesCrees,
        dejaExistants: rolesDejaExistants,
        totalAttendus: rolesAInitialiser.length
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles :", error);

    if (error.code === 11000) { // doublon (unique violation)
      return res.status(409).json({
        success: false,
        message: "Conflit d'unicité lors de la création d'un rôle"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation des données",
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'initialisation des rôles",
      error: error.message
    });
  }
});


// -----------------------------------------------------------------------------
// GET /roles
// Liste tous les rôles
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find()
      .select('_id nom createdAt')   // on choisit ce qu'on renvoie
      .sort({ nom: 1 });             // tri alphabétique par nom

    res.json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rôles',
      error: error.message
    });
  }
});

// -----------------------------------------------------------------------------
// GET /roles/:id
// Récupère un rôle par son ID
// -----------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .select('_id nom createdAt');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rôle non trouvé'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error(error);

    // Cas où l'ID n'est pas un ObjectId valide
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// -----------------------------------------------------------------------------
// POST /roles
// Création d'un nouveau rôle
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le champ "nom" est obligatoire'
      });
    }

    // Vérification existence (grâce à unique + find)
    const existe = await Role.findOne({ nom: nom.trim().toLowerCase() });
    if (existe) {
      return res.status(409).json({
        success: false,
        message: 'Un rôle avec ce nom existe déjà'
      });
    }

    const nouveauRole = new Role({
      nom: nom.trim()
    });

    const roleCree = await nouveauRole.save();

    res.status(201).json({
      success: true,
      message: 'Rôle créé avec succès',
      data: {
        _id: roleCree._id,
        nom: roleCree.nom,
        createdAt: roleCree.createdAt
      }
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) { // doublon MongoDB (unique)
      return res.status(409).json({
        success: false,
        message: 'Ce nom de rôle existe déjà'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rôle',
      error: error.message
    });
  }
});


module.exports = router;