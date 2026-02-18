const mongoose = require("mongoose");

const BoutiqueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: false
    },
    taille_m2: {
      type: Number,
      required: false,
    },
    loyer: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Boutique", BoutiqueSchema);
