const express = require("express");
const router = express.Router();
const Produit = require("../models/Produit");
const Utilisateur = require("../models/Utilisateur");
const Favoris = require("../models/Favoris");
const multer = require('multer');
const path = require('path');
const authMiddleware = require("../middleware/auth");

// Configuration multer
const storage = multer.diskStorage({
  destination: './uploads/produits/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post("/", authMiddleware, upload.single('image'), async (req, res) => {
    try {
      // 1. Récupérer l'utilisateur connecté via son ID (du token)
      const user = await Utilisateur.findById(req.user.id)
        .select('id_boutique')          // on ne prend QUE ce dont on a besoin
        .lean();                        // plus rapide, retourne objet JS simple


      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      if (!user.id_boutique) {
        return res.status(403).json({ 
          message: "Cet utilisateur n'est associé à aucune boutique" 
        });
      }

      // 2. Préparer les données du produit
      const produitData = {
        nom: req.body.nom,
        qt_actuel: Number(req.body.qt_actuel) || 0,
        qt_en_cours_commande: Number(req.body.qt_en_cours_commande) || 0,
        prix_actuel: Number(req.body.prix_actuel) || 0,
        
        id_boutique: user.id_boutique
      };

      if (req.file) {
        produitData.image = `/uploads/produits/${req.file.filename}`;
      }

      // 3. Créer et sauvegarder
      const produit = new Produit(produitData);
      await produit.save();

      // 4. Réponse (tu peux aussi populate si tu renvoies le produit)
      const produitPopulated = await Produit.findById(produit._id)
        .populate('id_boutique', 'nom adresse') 
        .lean();

      res.status(201).json(produitPopulated || produit);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message || "Erreur lors de la création" });
    }
  }
);

router.get("/boutique", authMiddleware, async (req, res) => {
  try {

    // 1. récupérer l'id de la boutique du user connecté
    const user = await Utilisateur.findById(req.user.id)
      .select('id_boutique')
      .lean();

    if (!user || !user.id_boutique) {
      return res.status(404).json({ message: "Aucune boutique associée à cet utilisateur" });
    }
    // 2. récupérer les produits de cette boutique
    const produits = await Produit.find({
      id_boutique: user.id_boutique
    }).lean();

    res.json(produits);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const produits = await Produit.find();
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getGroupByBoutique () {
  return await Produit.aggregate([
      // Jointure avec la collection boutiques
      {
        $lookup: {
          from: "boutiques",               // nom de la collection MongoDB
          localField: "id_boutique",
          foreignField: "_id",
          as: "boutique"
        }
      },

      // Déplier le tableau boutique
      {
        $unwind: "$boutique"
      },

      // Regroupement par boutique
      {
        $group: {
          _id: "$boutique._id",
          boutique: {
            $first: {
              _id: "$boutique._id",
              nom: "$boutique.nom"
            }
          },
          produits: {
            $push: {
              _id: "$_id",
              nom: "$nom",
              image: "$image",
              qt_actuel: "$qt_actuel",
              qt_en_cours_commande: "$qt_en_cours_commande",
              prix_actuel: "$prix_actuel",
              createdAt: "$createdAt",
              description: "$description"
            }
          }
        }
      },

      // Optionnel : tri par nom de boutique
      {
        $sort: {
          "boutique.nom": 1
        }
      }
    ]);
}
router.get("/group-by-boutique-client", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const favorisDocs = await Favoris.find(
      { id_utilisateur: userId },
      { id_produit: 1, _id: 0 }
    ).lean();

    const favorisSet = new Set(
      favorisDocs.map(doc => doc.id_produit.toString())
    );

    const produitsParBoutique = await getGroupByBoutique();

    const result = produitsParBoutique.map(boutiqueGroup => {
      const produitsAvecFavori = boutiqueGroup.produits.map(produit => ({
        ...produit,
        isFavorite: favorisSet.has(produit._id.toString())
      }));

      return {
        ...boutiqueGroup,                // garde _id, boutique, etc.
        produits: produitsAvecFavori     // remplace seulement produits
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/group-by-boutique", async (req, res) => {
  try {
    const produitsParBoutique = await getGroupByBoutique();

    res.json(produitsParBoutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Lire un produit par ID
router.get("/:id", async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);

    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un produit (complet ou partiel)
router.put("/:id", authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // 1. Vérifier que le produit existe
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    // 2. Vérifier que l'utilisateur est propriétaire de la boutique du produit
    const user = await Utilisateur.findById(req.user.id)
      .select('id_boutique')
      .lean();

    if (!user || !user.id_boutique) {
      return res.status(403).json({ message: "Aucune boutique associée à cet utilisateur" });
    }

    if (produit.id_boutique.toString() !== user.id_boutique.toString()) {
      return res.status(403).json({ 
        message: "Vous n'êtes pas autorisé à modifier ce produit (pas propriétaire de la boutique)" 
      });
    }

    // 3. Préparer les champs à mettre à jour
    const updateData = {};

    // Champs modifiables en PUT complet
    if (req.body.nom !== undefined)           updateData.nom = req.body.nom;
    if (req.body.description !== undefined)   updateData.description = req.body.description;
    if (req.body.qt_actuel !== undefined)     updateData.qt_actuel = Number(req.body.qt_actuel);
    if (req.body.qt_en_cours_commande !== undefined) {
      updateData.qt_en_cours_commande = Number(req.body.qt_en_cours_commande);
    }
    if (req.body.prix_actuel !== undefined)   updateData.prix_actuel = Number(req.body.prix_actuel);

    // Gestion de l'image (remplacement)
    if (req.file) {
      updateData.image = `/uploads/produits/${req.file.filename}`;
      
    }

    // 4. Mise à jour effective (seulement les champs envoyés)
    const produitMisAJour = await Produit.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!produitMisAJour) {
      return res.status(404).json({ message: "Produit introuvable lors de la mise à jour" });
    }

    // 5. Réponse
    res.json({
      message: "Produit mis à jour avec succès",
      produit: produitMisAJour
    });

  } catch (error) {
    console.error("Erreur PUT /produit/:id :", error);
    res.status(400).json({ 
      message: "Erreur lors de la mise à jour du produit",
      error: error.message 
    });
  }
});

// Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);

    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
