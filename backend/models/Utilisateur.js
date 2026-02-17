const mongoose = require('mongoose');

const UtilisateurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true
    },
    prenom: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      lowercase: true,
      trim: true
    },
    mdp: {
      type: String,
      required: true,
      select: false
    },
    id_boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique'
    },
    id_role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Utilisateur', UtilisateurSchema);