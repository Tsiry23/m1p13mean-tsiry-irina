const mongoose = require("mongoose");

const CommandeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: false,
    },

    date_confirmation: {
      type: Date,
      required: false,
      default: null,
    },
    date_preparation: {
      type: Date,
      required: false,
      default: null,
    },
    date_recuperation_prevue: {
      type: Date,
      required: true,
    },
    date_recuperation: {
      type: Date,
      required: false,
      default: null,
    },

    date_rejet: {
      type: Date,
      required: false,
      default: null,
    },
    date_annulation: {
      type: Date,
      required: false,
      default: null,
    },
    date_remboursement: {
      type: Date,
      required: false,
      default: null,
    },

    id_client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    id_vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Commande", CommandeSchema);
