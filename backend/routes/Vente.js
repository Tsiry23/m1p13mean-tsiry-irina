const express = require("express");
const router = express.Router();
const Vente = require("../models/Vente");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

router.post("/enregistrer",authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      type,                    // "vente" ou "commande" → obligatoire
      id_client,
      id_type_paiement,
      date_recuperation_prevue,
      produits,                // tableau obligatoire
    } = req.body;

    if (!type || !["vente", "commande"].includes(type)) {
      return res.status(400).json({ message: "type doit être 'vente' ou 'commande'" });
    }

    if (!id_client || !mongoose.isValidObjectId(id_client)) {
      return res.status(400).json({ message: "id_client invalide" });
    }

    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "produits est requis et doit être un tableau non vide" });
    }

    const id_vendeur = req.user.id;
    if (!id_vendeur) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // 1. Calcul du total et vérification des produits
    let total = 0;
    const detailsToCreate = [];

    for (const item of produits) {
      const { id_produit, qt, prix_vente } = item;

      if (!id_produit || !mongoose.isValidObjectId(id_produit)) {
        throw new Error(`ID produit invalide : ${id_produit}`);
      }

      if (!qt || qt < 1 || !Number.isInteger(qt)) {
        throw new Error(`Quantité invalide pour le produit ${id_produit}`);
      }

      const produit = await Produit.findById(id_produit).session(session);
      if (!produit) {
        throw new Error(`Produit introuvable : ${id_produit}`);
      }

      const prixUnitaire = produit.prix_vente;
      if (!prixUnitaire || prixUnitaire <= 0) {
        throw new Error(`Prix invalide pour ${produit.nom || id_produit}`);
      }

      total += prixUnitaire * qt;

      detailsToCreate.push({
        qt,
        prix_vente: prixUnitaire,
        id_produit,
        // id_vente ou id_commande sera rempli après création
      });
    }

    let venteOuCommande;

    if (type === "vente") {
      // ────────────────────────────────────────────────
      // Création VENTE
      // ────────────────────────────────────────────────
      if (!id_type_paiement || !mongoose.isValidObjectId(id_type_paiement)) {
        throw new Error("id_type_paiement requis pour une vente");
      }

      venteOuCommande = new Vente(
        {
          date: new Date(),
          total,
          id_vendeur,
          id_client,
          id_type_paiement,
        },
        { session }
      );

      await venteOuCommande.save({ session });

      // Rattacher les détails à la vente
      for (const detail of detailsToCreate) {
        detail.id_vente = venteOuCommande._id;
        await new DetailVente(detail).save({ session });
      }

      res.status(201).json({
        success: true,
        message: "Vente enregistrée avec succès",
        id_vente: venteOuCommande._id,
        total,
      });
    } else {
      // ────────────────────────────────────────────────
      // Création COMMANDE
      // ────────────────────────────────────────────────
      if (!date_recuperation_prevue) {
        throw new Error("date_recuperation_prevue requise pour une commande");
      }

      venteOuCommande = new Commande(
        {
          date: new Date(),
          total,                     // peut être mis à jour plus tard
          id_client,
          id_vendeur,
          date_recuperation_prevue: new Date(date_recuperation_prevue),
          // id_boutique ? → à ajouter si nécessaire
        },
        { session }
      );

      await venteOuCommande.save({ session });

      // Rattacher les détails à la commande
      for (const detail of detailsToCreate) {
        detail.id_commande = venteOuCommande._id;
        await new DetailVente(detail).save({ session });
      }

      res.status(201).json({
        success: true,
        message: "Commande enregistrée avec succès",
        id_commande: venteOuCommande._id,
        total,
      });
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de l'enregistrement",
    });
  } finally {
    session.endSession();
  }
});

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
