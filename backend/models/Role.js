const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    // id → géré automatiquement par MongoDB → on n'a pas besoin de le déclarer
    // (ObjectId par défaut)

    nom: {
      type: String,
      required: [true, 'Le nom du rôle est obligatoire'],
      trim: true,
      maxlength: [50, 'Le nom du rôle ne peut pas dépasser 50 caractères'],
      unique: true,           // évite les doublons (ex: deux "admin")
      lowercase: true         // optionnel : uniformise (admin / Admin → même valeur)
    },

  },
  {
    timestamps: true,         // createdAt & updatedAt
    versionKey: false         // on supprime __v
  }
);

// Index pour recherche rapide sur nom (déjà unique mais on le rend explicite)
RoleSchema.index({ nom: 1 });

module.exports = mongoose.model('Role', RoleSchema);