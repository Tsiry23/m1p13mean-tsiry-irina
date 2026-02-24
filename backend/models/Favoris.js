const mongoose = require("mongoose");

const FavorisSchema = new mongoose.Schema(
  {
    id_utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    id_produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);
// empêcher d'ajouter 2 fois le même produit en favori
FavorisSchema.index({ id_utilisateur: 1, id_produit: 1 }, { unique: true });

module.exports = mongoose.model("Favoris", FavorisSchema);
