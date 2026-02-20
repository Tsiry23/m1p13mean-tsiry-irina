const mongoose = require("mongoose");

const TypePaiementSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      maxlength: 50
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("TypePaiement", TypePaiementSchema);
