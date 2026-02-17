const express = require("express");
const router = express.Router();
const Vente = require("../models/Vente");

// Créer une vente
router.post("/", async (req, res) => {
  try {
    const vente = new Vente(req.body);
    await vente.save();
    res.status(201).json(vente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les ventes
router.get("/", async (req, res) => {
  try {
    const ventes = await Vente.find();
    res.json(ventes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire une vente par ID
router.get("/:id", async (req, res) => {
  try {
    const vente = await Vente.findById(req.params.id);
    if (!vente) {
      return res.status(404).json({ message: "Vente introuvable" });
    }
    res.json(vente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une vente
router.put("/:id", async (req, res) => {
  try {
    const vente = await Vente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vente) {
      return res.status(404).json({ message: "Vente introuvable" });
    }
    res.json(vente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une vente
router.delete("/:id", async (req, res) => {
  try {
    const vente = await Vente.findByIdAndDelete(req.params.id);
    if (!vente) {
      return res.status(404).json({ message: "Vente introuvable" });
    }
    res.json({ message: "Vente supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
