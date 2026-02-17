const express = require("express");
const router = express.Router();
const Commande = require("../models/Commande");

// Créer une commande
router.post("/", async (req, res) => {
  try {
    const commande = new Commande(req.body);
    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les commandes
router.get("/", async (req, res) => {
  try {
    const commandes = await Commande.find();
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire une commande par ID
router.get("/:id", async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une commande
router.put("/:id", async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une commande
router.delete("/:id", async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json({ message: "Commande supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
