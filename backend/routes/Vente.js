const express = require("express");
const router = express.Router();
const Vente = require("../models/Vente");
const Commande = require("../models/Commande");
const DetailVente = require("../models/DetailVente");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");
const Produit = require("../models/Produit");

router.post("/enregistrer", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      id_client,
      id_type_paiement,
      date_recuperation_prevue,
      produits,
    } = req.body;

    // 1. Validations de base
    if (!type || !["vente", "commande"].includes(type)) {
      return res.status(400).json({ message: "type doit être 'vente' ou 'commande'" });
    }

    if (id_client && !mongoose.isValidObjectId(id_client)) {
      return res.status(400).json({ message: "id_client invalide" });
    }

    if (!id_type_paiement || !mongoose.isValidObjectId(id_type_paiement)) {
      return res.status(400).json({
        message: "id_type_paiement est obligatoire (même pour les commandes payées à l'avance)"
      });
    }

    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "produits est requis et doit être un tableau non vide" });
    }

    const id_vendeur = req.user?.id;
    if (!id_vendeur) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // 2. Chargement et vérification de tous les produits + stock
    let total = 0;
    const detailsPrepares = [];
    const produitsAUpdater = []; // { produit, nouvelleQt }

    const idsProduits = produits.map(p => p.id_produit);
    const produitsEnBase = await Produit.find({ _id: { $in: idsProduits } });

    const mapProduits = new Map(produitsEnBase.map(p => [p._id.toString(), p]));

    for (const item of produits) {
      const { id_produit, qt } = item;

      if (!mongoose.isValidObjectId(id_produit)) {
        return res.status(400).json({ message: `ID produit invalide : ${id_produit}` });
      }

      const produit = mapProduits.get(id_produit);
      if (!produit) {
        return res.status(404).json({ message: `Produit introuvable : ${id_produit}` });
      }

      if (!qt || qt < 1 || !Number.isInteger(qt)) {
        return res.status(400).json({ message: `Quantité invalide pour ${produit.nom || id_produit}` });
      }

      if (produit.qt_actuel < qt) {
        return res.status(409).json({
          message: `Stock insuffisant pour ${produit.nom || id_produit} (disponible: ${produit.qt_actuel}, demandé: ${qt})`
        });
      }

      const prixUnitaire = produit.prix_actuel;
      if (!prixUnitaire || prixUnitaire <= 0) {
        return res.status(400).json({ message: `Prix invalide pour ${produit.nom || id_produit}` });
      }

      total += prixUnitaire * qt;

      detailsPrepares.push({
        id_produit,
        qt,
        prix_vente: prixUnitaire
      });

      // Préparation de la mise à jour du stock (on le fera après insertion si tout OK)
      produitsAUpdater.push({
        produit,
        nouvelleQt: produit.qt_actuel - qt
      });
    }

    // 3. Validation spécifique au type
    let dateRecup = null;
    if (type === "commande") {
      if (!date_recuperation_prevue) {
        return res.status(400).json({ message: "date_recuperation_prevue est obligatoire pour une commande" });
      }

      dateRecup = new Date(date_recuperation_prevue);
      if (isNaN(dateRecup.getTime())) {
        return res.status(400).json({ message: "Format de date invalide" });
      }
    }

    // ────────────────────────────────────────────────
    // Tout est validé → on commence les insertions
    // ────────────────────────────────────────────────

    let document;

    if (type === "vente") {
      document = new Vente({
        date: new Date(),
        total,
        id_vendeur,
        id_client: id_client || null,
        id_type_paiement,
      });
    } else {
      document = new Commande({
        date: new Date(),
        total,
        id_vendeur,
        id_client: id_client || null,
        id_type_paiement,
        date_recuperation_prevue: dateRecup,
      });
    }

    await document.save();

    // Insertion des détails
    for (const detail of detailsPrepares) {
      const detailDoc = new DetailVente({
        ...detail,
        ...(type === "vente" ? { id_vente: document._id } : { id_commande: document._id })
      });
      await detailDoc.save();
    }

    // Mise à jour du stock de chaque produit (seulement si tout s'est bien passé jusqu'ici)
    for (const { produit, nouvelleQt } of produitsAUpdater) {
      if (nouvelleQt < 0) {
        // Sécurité supplémentaire (ne devrait pas arriver vu les vérifs précédentes)
        throw new Error(`Stock négatif détecté pour ${produit.nom || produit._id}`);
      }

      produit.qt_actuel = nouvelleQt;
      await produit.save();
    }

    // Succès
    res.status(201).json({
      success: true,
      message: type === "vente" ? "Vente enregistrée avec succès" : "Commande enregistrée avec succès",
      id: document._id.toString(),
      type,
      total,
    });

  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);

    // En cas d'erreur tardive (ex: échec save() d'un détail ou d'un produit)
    // Le stock n'aura pas été diminué (car on le fait en dernier)
    // Mais la vente/commande peut exister partiellement → c'est le trade-off sans transaction

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement",
      detail: error.message
    });
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
