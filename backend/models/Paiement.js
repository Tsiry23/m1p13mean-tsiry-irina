const mongoose = require("mongoose");

const PaiementSchema = new mongoose.Schema(
  {
    total_a_payer: {
      type: Number,
      required: true,
      min: 0
    },

    date_: {
      type: Date,
      required: true,
      default: Date.now
    },

    id_boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Paiement", PaiementSchema);