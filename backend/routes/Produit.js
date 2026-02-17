const express = require("express");
const router = express.Router();
const Produit = require("../models/Produit");

// Créer un produit
router.post("/", async (req, res) => {
  try {
    const produit = new Produit(req.body);
    await produit.save();
    res.status(201).json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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
