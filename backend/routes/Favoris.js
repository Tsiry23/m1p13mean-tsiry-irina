const express = require('express');
const router = express.Router();
const Favoris = require('../models/Favoris');
const Utilisateur = require('../models/Utilisateur');
const Produit = require('../models/Produit');

const authMiddleware = require("../middleware/auth");

// Créer une favoris
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {id_produit} = req.body;
    const produit = await Produit.findById(id_produit);
    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    if(!(req.user.role === 'client')){
        return res.status(403).json({ message: "profil invalide" });
    }

    const favoris = new Favoris({
        id_utilisateur: req.user.id,
        id_produit: id_produit
    });
    await favoris.save();
    res.status(201).json(favoris);
  } catch (error) {
    if (error.code === 11000) { // doublon (violation index unique)
      return res.status(409).json({ message: "Ce produit est déjà dans vos favoris" });
    }
    res.status(400).json({ message: error.message });
  }
});


router.delete("/:idProduit", authMiddleware, async (req, res) => {
  try {
    const id_produit = req.params.idProduit;
    const id_utilisateur = req.user.id ;  // ← tolérant aux deux

    // Pour debug immédiat, ajoute ça :
    console.log("Utilisateur connecté :", req.user);
    console.log("ID utilisateur utilisé :", id_utilisateur);
    console.log("ID produit :", id_produit);

    if (!id_utilisateur) {
      return res.status(401).json({ message: "Utilisateur non identifié" });
    }

    const favori = await Favoris.findOneAndDelete({
      id_utilisateur: id_utilisateur,
      id_produit: id_produit
    });

    if (!favori) {
      // Debug supplémentaire
      const existe = await Favoris.findOne({
        id_utilisateur: id_utilisateur,
        id_produit: id_produit
      });
      console.log("Existe dans la base ? ", existe);

      return res.status(404).json({ 
        message: "Ce produit n'était pas dans vos favoris" 
      });
    }

    res.status(200).json({ 
      message: "Produit retiré des favoris avec succès",
      id_produit 
    });
  } catch (error) {
    console.error("Erreur suppression favori :", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;