const mongoose = require("mongoose");

const ProduitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      maxlength: 50,
    },
    image: {
      type: Buffer,
      required: false,
    },
    qt_actuel: {
      type: Number,
      required: true,
    },
    qt_en_cours_commande: {
      type: Number,
      required: true,
    },
    prix_actuel: {
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

module.exports = mongoose.model("Produit", ProduitSchema);
