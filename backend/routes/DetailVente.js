const express = require("express");
const router = express.Router();
const DetailVente = require("../models/DetailVente");

// Créer un détail de vente
router.post("/", async (req, res) => {
  try {
    const detail = new DetailVente(req.body);
    await detail.save();
    res.status(201).json(detail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les détails
router.get("/", async (req, res) => {
  try {
    const details = await DetailVente.find();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire un détail par ID
router.get("/:id", async (req, res) => {
  try {
    const detail = await DetailVente.findById(req.params.id);
    if (!detail) {
      return res.status(404).json({ message: "Détail introuvable" });
    }
    res.json(detail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un détail
router.put("/:id", async (req, res) => {
  try {
    const detail = await DetailVente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!detail) {
      return res.status(404).json({ message: "Détail introuvable" });
    }
    res.json(detail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un détail
router.delete("/:id", async (req, res) => {
  try {
    const detail = await DetailVente.findByIdAndDelete(req.params.id);
    if (!detail) {
      return res.status(404).json({ message: "Détail introuvable" });
    }
    res.json({ message: "Détail supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
