const express = require("express");
const router = express.Router();
const Commande = require("../models/Commande");
const DetailVente = require("../models/DetailVente");

// Créer une commande
router.post("/", async (req, res) => {
  try {
    const commande = new Commande(req.body);
    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les commandes
router.get("/", async (req, res) => {
  try {
    const commandes = await Commande.find();
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function computeStatut(commande) {
  if (commande.date_remboursement) return "REMBOURSEE";
  if (commande.date_annulation) return "ANNULEE";
  if (commande.date_rejet) return "REJETEE";
  if (commande.date_recuperation) return "RECUPEREE";
  if (commande.date_preparation) return "PREPARATION";
  if (commande.date_confirmation) return "CONFIRMEE";
  return "EN_ATTENTE";
}

// 🔎 Rechercher des commandes
router.post("/search", async (req, res) => {
  try {
    const {
      client,
      dateReservationDebut,
      dateReservationFin,
      dateRecuperationDebut,
      dateRecuperationFin,
      statut,
      produit,
      quantiteMin,
      quantiteMax
    } = req.query;

    const commandeFilter = {};

    /* ===========================
       CLIENT
    ============================ */
    if (client) {
      commandeFilter.id_client = new mongoose.Types.ObjectId(client);
    }

    /* ===========================
       DATE DE RÉSERVATION
    ============================ */
    if (dateReservationDebut || dateReservationFin) {
      commandeFilter.date = {};
      if (dateReservationDebut)
        commandeFilter.date.$gte = new Date(dateReservationDebut);
      if (dateReservationFin)
        commandeFilter.date.$lte = new Date(dateReservationFin);
    }

    /* ===========================
       DATE DE RÉCUPÉRATION
    ============================ */
    if (dateRecuperationDebut || dateRecuperationFin) {
      commandeFilter.date_recuperation_prevue = {};
      if (dateRecuperationDebut)
        commandeFilter.date_recuperation_prevue.$gte = new Date(dateRecuperationDebut);
      if (dateRecuperationFin)
        commandeFilter.date_recuperation_prevue.$lte = new Date(dateRecuperationFin);
    }

    /* ===========================
       STATUT (logique métier)
    ============================ */
    if (statut) {
      switch (statut) {
        case "REMBOURSEE":
          commandeFilter.date_remboursement = { $ne: null };
          break;

        case "ANNULEE":
          commandeFilter.date_annulation = { $ne: null };
          break;

        case "REJETEE":
          commandeFilter.date_rejet = { $ne: null };
          break;

        case "RECUPEREE":
          commandeFilter.date_recuperation = { $ne: null };
          break;

        case "PREPARATION":
          commandeFilter.date_preparation = { $ne: null };
          break;

        case "CONFIRMEE":
          commandeFilter.date_confirmation = { $ne: null };
          break;

        case "CREEE":
          commandeFilter.date_confirmation = null;
          commandeFilter.date_rejet = null;
          commandeFilter.date_annulation = null;
          break;
      }
    }


    /* ===========================
       FILTRE PRODUIT / QUANTITÉ
    ============================ */
    let commandeIdsFromDetails = null;

    if (produit || quantiteMin || quantiteMax) {
      const detailFilter = {};

      if (produit) {
        detailFilter.id_produit = new mongoose.Types.ObjectId(produit);
      }

      if (quantiteMin || quantiteMax) {
        detailFilter.qt = {};
        if (quantiteMin) detailFilter.qt.$gte = Number(quantiteMin);
        if (quantiteMax) detailFilter.qt.$lte = Number(quantiteMax);
      }

      const details = await DetailVente.find(detailFilter).select("id_commande");

      commandeIdsFromDetails = details
        .filter(d => d.id_commande)
        .map(d => d.id_commande);

      // Aucun résultat possible
      if (commandeIdsFromDetails.length === 0) {
        return res.json([]);
      }
    }

    /* ===========================
       CROISEMENT DES FILTRES
    ============================ */
    if (commandeIdsFromDetails) {
      commandeFilter._id = { $in: commandeIdsFromDetails };
    }

    /* ===========================
       REQUÊTE FINALE
    ============================ */
    const commandes = await Commande.find(commandeFilter)
      .populate("id_client", "nom prenom")
      .populate("id_vendeur", "nom prenom")
      .sort({ date: -1 });

    const result = commandes.map(c => ({
      ...c.toObject(),
      statut: computeStatut(c)
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire une commande par ID
router.get("/:id", async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une commande
router.put("/:id", async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une commande
router.delete("/:id", async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json({ message: "Commande supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
