const express = require("express");
const router = express.Router();
const Boutique = require("../models/Boutique");
const Role = require("../models/Role");
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/auth");

const { upload, uploadToCloudinary } = require('../middleware/uploadToCloudinary');
const Utilisateur = require("../models/Utilisateur");



// Créer une boutique
router.post(
  "/",
  authMiddleware,
   upload.single('image'),uploadToCloudinary,
  async (req, res) => {
    try {
      // ==============================
      // 1️⃣ Préparer les données boutique
      // ==============================
      const boutiqueData = {
        nom: req.body.nom,
        description: req.body.description || null,

        taille_m2:
          req.body.taille_m2 !== undefined
            ? Number(req.body.taille_m2)
            : null,

        loyer:
          req.body.loyer !== undefined
            ? Number(req.body.loyer)
            : null,
      };

      // image (optionnelle)
      if (req.file) {
        // boutiqueData.image = `/uploads/boutiques/${req.file.filename}`;
        boutiqueData.image = req.cloudinary.url;
      }

      // ==============================
      // 2️⃣ Création & sauvegarde
      // ==============================
      const email = req.body.email;   
      console.log(email)

      if (!email) {
        return res.status(400).json({ 
          message: "L'email de l'utilisateur destinataire est requis" 
        });
      }

      const user = await Utilisateur.findOne({ email });

      if (!user) {
        return res.status(404).json({ 
          message: `Utilisateur avec l'email ${email} introuvable` 
        });
      }


      // ==============================
      // 3️⃣ Création & sauvegarde de la boutique
      // ==============================
      const boutique = new Boutique(boutiqueData);
      await boutique.save();


      // ==============================
      // 4️⃣ Attribution rôle + boutique à l’utilisateur
      // ==============================
      const role = await Role.findOne({ nom: "admin de boutique" });


      if (!role) {
        // Option A : rollback (supprimer la boutique créée)
        await Boutique.findByIdAndDelete(boutique._id);
        return res.status(500).json({ 
          message: "Rôle 'admin de boutique' introuvable dans la base" 
        });
      }

      // Mise à jour de l’utilisateur
      user.id_role    = role._id;
      user.id_boutique = boutique._id;

        console.log("hey saving")
      await user.save();   // ← très important !

        console.log("hey final")
      // ==============================
      // 3️⃣ Réponse
      // ==============================
      res.status(201).json(boutique);

    } catch (error) {
      console.error(error);
      console.error("ERREUR CRÉATION BOUTIQUE :", error);
      console.error("Body reçu :", req.body);
      console.error("Fichier reçu :", req.file);
      console.error("Cloudinary :", req.cloudinary);
      res.status(400).json({
        message: error.message || "Erreur lors de la création de la boutique",
      });
    }
  }
);

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

  try {
    let boutiques = [];
  
    boutiques.push(new Boutique({ nom : "San Marina", description : "Magasin chaussure" , taille_m2 : 125, loyer : 5625000, image : "/boutique1.jpg" }));
    boutiques.push(new Boutique({ nom : "Christian Dior parfum", description : "Magasin parfum" , taille_m2 : 50, loyer : 3400000, image : "/boutique2.jpg" }));
    boutiques.push(new Boutique({ nom : "Food & friends", description : "Food court" ,taille_m2 : 200, loyer : 9000000, image : "/boutique3.jpg" }));
    boutiques.push(new Boutique({ nom : "Patatam", description : "Magasin de vêtements", taille_m2 : 150, loyer : 7500000, image : "/boutique4.jpg" }));
    boutiques.push(new Boutique({ nom : "Delicious", description : "Foodcourt" , taille_m2 : 150, loyer : 9000000, image : "/boutique5.jpg" }));

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
