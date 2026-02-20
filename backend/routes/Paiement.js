const express = require("express");
const router = express.Router();
const Paiement = require("../models/Paiement");

const authMiddleware = require("../middleware/auth");

// ➕ Créer un paiement
router.post("/", authMiddleware, async (req, res) => {
  try {
    const paiement = new Paiement(req.body);
    await paiement.save();
    res.status(201).json(paiement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// 📄 Lire tous les paiements
router.get("/", authMiddleware, async (req, res) => {
  try {
    const paiements = await Paiement
      .find()
      .populate("id_boutique"); // optionnel mais très utile

    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 📄 Lire un paiement par ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const paiement = await Paiement
      .findById(req.params.id)
      .populate("id_boutique");

    if (!paiement) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    res.json(paiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✏️ Mettre à jour un paiement
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!paiement) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    res.json(paiement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// 🗑️ Supprimer un paiement
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);

    if (!paiement) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    res.json({ message: "Paiement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;