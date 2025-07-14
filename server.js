require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Inscricao = require("./models/Inscricao");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("🟢 Conectado ao MongoDB");
  })
  .catch((err) => {
    console.error("🔴 Erro ao conectar no MongoDB:", err);
  });

// Rota inicial (abre index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Função para gerar número aleatório único (1 a 50)
async function gerarNumeroUnico() {
  const usados = await Inscricao.find().distinct("numero");
  const disponiveis = Array.from({ length: 50 }, (_, i) => i + 1).filter(
    (n) => !usados.includes(n)
  );
  if (disponiveis.length === 0) return null;
  const aleatorio = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  return aleatorio;
}

// POST /inscricao — envia uma nova inscrição
app.post("/inscricao", async (req, res) => {
  const { nome, telefone, setor } = req.body;

  if (!nome || !telefone || !setor) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  const numero = await gerarNumeroUnico();
  if (!numero) {
    return res
      .status(400)
      .json({ erro: "Limite de 50 participantes atingido" });
  }

  try {
    const nova = new Inscricao({ nome, telefone, setor, numero });
    await nova.save();
    res.status(201).json({ mensagem: "Inscrição salva com sucesso", numero });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar inscrição" });
  }
});

// GET /inscritos — retorna todos os participantes ordenados por nome
app.get("/inscritos", async (req, res) => {
  try {
    const todos = await Inscricao.find().sort({ nome: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar inscritos" });
  }
});

// GET /contagem — retorna quantos já se inscreveram
app.get("/contagem", async (req, res) => {
  try {
    const total = await Inscricao.countDocuments();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao contar inscritos" });
  }
});

let numerosSorteados = new Set();

// GET /sorteio  → devolve { numero, pessoa }
app.get("/sorteio", async (req, res) => {
  try {
    // 1. Pega todos os inscritos (com número)
    const inscritos = await Inscricao.find(
      {},
      { _id: 0, nome: 1, setor: 1, numero: 1 }
    );

    if (numerosSorteados.size >= inscritos.length) {
      return res
        .status(400)
        .json({ erro: "Todos os números já foram sorteados!" });
    }

    // 2. Escolhe um número aleatório NÃO sorteado ainda
    let sorteado;
    do {
      sorteado = Math.floor(Math.random() * 50) + 1; // 1‑50
    } while (numerosSorteados.has(sorteado));

    // 3. Marca como já sorteado
    numerosSorteados.add(sorteado);

    // 4. Encontra a pessoa
    const pessoa = inscritos.find((p) => p.numero === sorteado);

    if (!pessoa) {
      // Caso raro: número ainda não atribuído
      return res.json({ numero: sorteado, pessoa: null });
    }

    res.json({ numero: sorteado, pessoa });
  } catch (err) {
    res.status(500).json({ erro: "Erro no sorteio" });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
