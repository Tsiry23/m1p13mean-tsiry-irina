const express = require("express");
const router = express.Router();
const TypePaiement = require("../models/TypePaiement");


// ➕ Créer un type de paiement
router.post("/", async (req, res) => {
  try {
    const typePaiement = new TypePaiement(req.body);
    await typePaiement.save();
    res.status(201).json(typePaiement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// 📄 Lire tous les types de paiement
router.get("/", async (req, res) => {
  try {
    const typesPaiement = await TypePaiement.find();
    res.json(typesPaiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🚀 Initialisation des types de paiement
router.get("/init", async (req, res) => {
  try {
    const typesPaiement = [
      new TypePaiement({ nom: "Espèces" }),
      new TypePaiement({ nom: "Orange Money" }),
      new TypePaiement({ nom: "MVola" }),
      new TypePaiement({ nom: "Carte Visa" }),
      new TypePaiement({ nom: "Mastercard" })
    ];

    for (const type of typesPaiement) {
      await type.save();
    }

    res.status(200).json(typesPaiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔍 Lire un type de paiement par ID
router.get("/:id", async (req, res) => {
  try {
    const typePaiement = await TypePaiement.findById(req.params.id);

    if (!typePaiement) {
      return res.status(404).json({ message: "Type de paiement introuvable" });
    }

    res.json(typePaiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✏️ Mettre à jour un type de paiement
router.put("/:id", async (req, res) => {
  try {
    const typePaiement = await TypePaiement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!typePaiement) {
      return res.status(404).json({ message: "Type de paiement introuvable" });
    }

    res.json(typePaiement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// ❌ Supprimer un type de paiement
router.delete("/:id", async (req, res) => {
  try {
    const typePaiement = await TypePaiement.findByIdAndDelete(req.params.id);

    if (!typePaiement) {
      return res.status(404).json({ message: "Type de paiement introuvable" });
    }

    res.json({ message: "Type de paiement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
