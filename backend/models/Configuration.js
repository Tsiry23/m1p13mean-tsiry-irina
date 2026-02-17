const mongoose = require("mongoose");

const ConfigurationSchema = new mongoose.Schema(
  {
    cle: {
      type: String,
      required: true,
      maxlength: 50,
    },
    valeur: {
      type: String,
      required: false
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Configuration", ConfigurationSchema);
