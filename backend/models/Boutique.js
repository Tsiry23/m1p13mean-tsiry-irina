const mongoose = require("mongoose");

const BoutiqueSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },

    description: {
      type: String,
      default: null,
    },

    taille_m2: {
      type: Number,
      min: 0,
      default: null,
    },

    loyer: {
      type: Number,
      min: 0,
      default: null,
    },

    image: {
      type: String,
    },

    contrat: {
      type: String,
      default: null, // chemin fichier / référence contrat
    },

    debut_contrat: {
      type: Date,
      default: null,
    },

    fin_contrat: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },

    heure_ouverture: {
      type: String, // "08:00"
      default: null,
    },

    heure_fermeture: {
      type: String, // "18:00"
      default: null,
    },

    contact: {
      type: [String], // téléphones / personnes
      default: [],
    },

    mail: {
      type: [String],
      lowercase: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Boutique", BoutiqueSchema);