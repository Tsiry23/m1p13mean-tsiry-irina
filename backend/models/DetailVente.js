const mongoose = require("mongoose");

const DetailVenteSchema = new mongoose.Schema(
  {
    qt: {
      type: Number,
      required: true,
    },
    prix_vente: {
      type: Number,
      required: false,
    },
    id_produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produit",
      required: true,
    },
    id_vente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vente",
      required: false,
    },
    id_commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DetailVente", DetailVenteSchema);
