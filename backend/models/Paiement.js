const mongoose = require("mongoose");

const PaiementSchema = new mongoose.Schema(
  {
    total_a_payer: {
      type: Number,
      required: true,
      min: 0,
    },

    periode: {
      type: Date,
      required: true, // représente le mois concerné (ex: 2026-02-01)
    },

    date_: {
      type: Date,
      required: true,
      default: Date.now,
    },

    en_retard: {
      type: Boolean,
      default: false,
    },

    id_boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },

    nom_boutique: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Paiement", PaiementSchema);