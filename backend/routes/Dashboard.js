const mongoose = require("mongoose");

const Boutique = require("../models/Boutique");
const Paiement = require("../models/Paiement");
const HistoLoyer = require("../models/HistoLoyer");
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.get("/metrics", async (req, res) => {
  try {
    // 1️⃣ Période (mois courant par défaut)
    const periodeParam = req.query.periode
      ? new Date(req.query.periode)
      : new Date();

    const startOfMonth = new Date(
      Date.UTC(periodeParam.getFullYear(),
      periodeParam.getMonth(),
      1)
    );

    const endOfMonth = new Date(
      Date.UTC(periodeParam.getFullYear(),
      periodeParam.getMonth() + 1,
      1)
    );

    // 2️⃣ Boutiques
    const totalBoutiques = await Boutique.countDocuments();

    const boutiquesActives = await Boutique.countDocuments({
      active: true,
    });

    // 3️⃣ Loyer attendu (boutiques actives uniquement)
    const loyerAgg = await Boutique.aggregate([
      {
        $match: {
          active: true,
          loyer: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$loyer" },
        },
      },
    ]);

    const loyerAttendu = loyerAgg[0]?.total || 0;

    // 4️⃣ Total payé pour la période
    const paiementAgg = await Paiement.aggregate([
      {
        $match: {
          periode: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total_a_payer" },
        },
      },
    ]);

    const totalPaye = paiementAgg[0]?.total || 0;

    // 5️⃣ Calculs finaux
    const resteARecevoir = Math.max(loyerAttendu - totalPaye, 0);

    const tauxOccupation =
      totalBoutiques === 0
        ? 0
        : Number(((boutiquesActives / totalBoutiques) * 100).toFixed(2));

    // 6️⃣ Réponse
    res.json({
      periode: startOfMonth,
      totalBoutiques,
      boutiquesActives,
      tauxOccupation,
      loyerAttendu,
      totalPaye,
      resteARecevoir,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ message: "Erreur serveur dashboard metrics" });
  }
});

router.get("/paiements/evolution", async (req, res) => {
  try {
    const { annee, id_boutique } = req.query;

    if (!annee) {
      return res.status(400).json({ message: "Paramètre 'annee' requis" });
    }

    const year = parseInt(annee, 10);

    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

    // 1️⃣ Match dynamique
    const matchStage = {
      periode: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
    };

    if (id_boutique) {
      matchStage.id_boutique = new mongoose.Types.ObjectId(id_boutique);
    }

    // 2️⃣ Aggregation
    const aggregation = await Paiement.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: { $month: "$periode" },
          totalPaye: { $sum: "$total_a_payer" },
        },
      },

      {
        $project: {
          _id: 0,
          mois: "$_id",
          totalPaye: 1,
        },
      },

      { $sort: { mois: 1 } },
    ]);

    // 3️⃣ Normalisation : toujours 12 mois
    const data = Array.from({ length: 12 }, (_, i) => {
      const mois = i + 1;
      const found = aggregation.find((a) => a.mois === mois);
      return {
        mois,
        totalPaye: found ? found.totalPaye : 0,
      };
    });

    // 4️⃣ Réponse
    res.json({
      annee: year,
      id_boutique: id_boutique || null,
      data,
    });
  } catch (error) {
    console.error("Paiements evolution error:", error);
    res.status(500).json({ message: "Erreur serveur évolution paiements" });
  }
});

router.get("/histo-loyer", async (req, res) => {
  try {
    const {
      id_boutique,
      date_debut,
      date_fin,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // période par défaut = mois courant
    let startDate, endDate;

    const filter = {};

    if (date_debut || date_fin) {
      if (date_debut) {
        startDate = new Date(date_debut);

        filter.date_changement = {
          $gte: startDate
        };
      }

      if (date_fin) {
        endDate = new Date(date_fin);
        endDate.setHours(23, 59, 59, 999);

        filter.date_changement = {
          $lte: endDate
        };
      }
    }

    // ✅ filtre boutique optionnel
    if (id_boutique) {
      filter.id_boutique = id_boutique;
    }

    const [total, data] = await Promise.all([
      HistoLoyer.countDocuments(filter),
      HistoLoyer.find(filter)
        .populate("id_boutique", "nom")
        .sort({ date_changement: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
