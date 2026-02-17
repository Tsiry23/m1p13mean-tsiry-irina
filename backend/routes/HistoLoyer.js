const express = require("express");
const router = express.Router();
const HistoLoyer = require("../models/HistoLoyer");

// Créer un historique de loyer
router.post("/", async (req, res) => {
  try {
    const histoLoyer = new HistoLoyer(req.body);
    await histoLoyer.save();
    res.status(201).json(histoLoyer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les historiques de loyer
router.get("/", async (req, res) => {
  try {
    const histos = await HistoLoyer.find();
    res.json(histos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire un historique par ID
router.get("/:id", async (req, res) => {
  try {
    const histo = await HistoLoyer.findById(req.params.id);

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json(histo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un historique
router.put("/:id", async (req, res) => {
  try {
    const histo = await HistoLoyer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json(histo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un historique
router.delete("/:id", async (req, res) => {
  try {
    const histo = await HistoLoyer.findByIdAndDelete(req.params.id);

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json({ message: "Historique supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
