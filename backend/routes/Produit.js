const express = require("express");
const router = express.Router();
const Produit = require("../models/Produit");
const Utilisateur = require("../models/Utilisateur");
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

      console.log(user);

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

      console.log(produitData);

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

// Lire tous les produits
router.get("/", async (req, res) => {
  try {
    const produits = await Produit.find();
    res.json(produits);
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

// Mettre à jour un produit
router.put("/:id", async (req, res) => {
  try {
    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
