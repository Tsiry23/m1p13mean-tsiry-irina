const mongoose = require("mongoose");

const BoutiqueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      maxlength: 255,
    },
    taille_m2: {
      type: Number,
      required: false,
    },
    loyer: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Boutique", BoutiqueSchema);
