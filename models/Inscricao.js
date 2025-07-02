const mongoose = require("mongoose");

const inscricaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  setor: { type: String, required: true },
  numero: { type: Number, required: true, unique: true },
  data: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inscricao", inscricaoSchema);
