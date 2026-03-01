const express = require("express");
const router = express.Router();
const HistoLoyer = require("../models/HistoLoyer");
const Boutique = require("../models/Boutique")

const authMiddleware = require("../middleware/auth");

router.get("/init", async (req, res) => {
  try {
    const boutiques = await Boutique.find({
      loyer: { $ne: null }
    });

    if (boutiques.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune boutique avec loyer trouvée"
      });
    }

    const crees = [];
    const existants = [];

    for (const boutique of boutiques) {

      // 🔍 Vérifier s'il existe déjà un historique
      const dejaExiste = await HistoLoyer.findOne({
        id_boutique: boutique._id
      });

      if (dejaExiste) {
        existants.push(boutique.nom);
        continue;
      }

      // 📅 Date aléatoire avant aujourd'hui
      const dateChangement = randomPastDate(2);

      await HistoLoyer.create({
        id_boutique: boutique._id,
        nouvelle_valeur: boutique.loyer,
        date_changement: dateChangement
      });

      crees.push(boutique.nom);
    }

    res.json({
      success: true,
      totalBoutiques: boutiques.length,
      historiquesCrees: crees.length,
      historiquesExistants: existants.length,
      crees,
      existants
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur init historique loyer"
    });
  }
});

// 🔍 Récupérer l'historique de loyer par boutique
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { id_boutique } = req.query;

    if (!id_boutique) {
      return res.status(400).json({
        message: "id_boutique requis"
      });
    }

    const histos = await HistoLoyer
      .find({ id_boutique })
      .sort({ date_changement: 1 }); // chronologique

    res.json(histos);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur récupération historique loyer"
    });
  }
});

// Créer un historique de loyer
router.post("/", authMiddleware, async (req, res) => {
  try {
    const histoLoyer = new HistoLoyer(req.body);
    await histoLoyer.save();
    res.status(201).json(histoLoyer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les historiques de loyer
router.get("/", async (req, res) => {
  try {
    const histos = await HistoLoyer.find();
    res.json(histos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire un historique par ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const histo = await HistoLoyer.findById(req.params.id);

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json(histo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un historique
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const histo = await HistoLoyer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json(histo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un historique
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const histo = await HistoLoyer.findByIdAndDelete(req.params.id);

    if (!histo) {
      return res.status(404).json({ message: "Historique introuvable" });
    }

    res.json({ message: "Historique supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function randomPastDate(maxYearsBack = 2) {
  const now = new Date();
  const past = new Date();
  past.setFullYear(now.getFullYear() - maxYearsBack);

  const randomTime =
    past.getTime() +
    Math.random() * (now.getTime() - past.getTime());

  return new Date(randomTime);
}

module.exports = router;
