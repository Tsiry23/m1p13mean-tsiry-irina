const mongoose = require("mongoose");

const HistoLoyerSchema = new mongoose.Schema(
  {
    date_changement: {
      type: Date,
      required: true,
    },
    nouvelle_valeur: {
      type: Number,
      required: true,
    },
    id_boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HistoLoyer", HistoLoyerSchema);
