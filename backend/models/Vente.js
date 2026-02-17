const mongoose = require("mongoose");

const VenteSchema = new mongoose.Schema(
  {
    date_: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    id_vendeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
    id_client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateur",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vente", VenteSchema);
