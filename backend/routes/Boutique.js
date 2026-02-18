const express = require("express");
const router = express.Router();
const Boutique = require("../models/Boutique");

// Créer une boutique
router.post("/", async (req, res) => {
  try {
    const boutique = new Boutique(req.body);
    await boutique.save();
    res.status(201).json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les boutiques
router.get("/", async (req, res) => {
  try {
    const boutiques = await Boutique.find();
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/init", async (req, res) => {

  console.log("TAFIDITRA");

  try {
    let boutiques = [];
  
    boutiques.push(new Boutique({ nom : "San Marina", description : "Magasin chaussure" , taille_m2 : 125, loyer : 5625000, image : "boutique1.jpg" }));
    boutiques.push(new Boutique({ nom : "Christian Dior parfum", description : "Magasin parfum" , taille_m2 : 50, loyer : 3400000, image : "boutique2.jpg" }));
    boutiques.push(new Boutique({ nom : "Food & friends", description : "Food court" ,taille_m2 : 200, loyer : 9000000, image : "boutique3.jpg" }));
    boutiques.push(new Boutique({ nom : "Patatam", description : "Magasin de vêtements", taille_m2 : 150, loyer : 7500000, image : "boutique4.jpg" }));
    boutiques.push(new Boutique({ nom : "Delicious", description : "Foodcourt" , taille_m2 : 150, loyer : 9000000, image : "boutique5.jpg" }));

    for (const boutique of boutiques) {
      await boutique.save();
    }

    res.status(200).json(boutiques);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire une boutique par ID
router.get("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique) {
      return res.status(404).json({ message: "Boutique introuvable" });
    }

    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une boutique
router.put("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!boutique) {
      return res.status(404).json({ message: "Boutique introuvable" });
    }

    res.json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une boutique
router.delete("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndDelete(req.params.id);

    if (!boutique) {
      return res.status(404).json({ message: "Boutique introuvable" });
    }

    res.json({ message: "Boutique supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
