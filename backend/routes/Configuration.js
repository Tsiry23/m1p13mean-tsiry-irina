const express = require("express");
const router = express.Router();
const Configuration = require("../models/Configuration");

// Créer une configuration
router.post("/", async (req, res) => {
  try {
    const configuration = new Configuration(req.body);
    await configuration.save();
    res.status(201).json(configuration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les configurations
router.get("/", async (req, res) => {
  try {
    const configurations = await Configuration.find();
    res.json(configurations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire une configuration par ID
router.get("/:id", async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id);

    if (!configuration) {
      return res.status(404).json({ message: "Configuration introuvable" });
    }

    res.json(configuration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une configuration
router.put("/:id", async (req, res) => {
  try {
    const configuration = await Configuration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!configuration) {
      return res.status(404).json({ message: "Configuration introuvable" });
    }

    res.json(configuration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une configuration
router.delete("/:id", async (req, res) => {
  try {
    const configuration = await Configuration.findByIdAndDelete(req.params.id);

    if (!configuration) {
      return res.status(404).json({ message: "Configuration introuvable" });
    }

    res.json({ message: "Configuration supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
