import express from 'express';
import mongoose from "mongoose";
mongoose.connect("mongodb://admin:secret@127.0.0.1:27017/loja?authSource=admin");

let db = mongoose.connection;

const ebookSchema = new mongoose.Schema({
  id: { type: mongoose.Types.ObjectId },
  nome: { type: String, required: true },
  repo: { type: String, required: true },
})
const Ebook = mongoose.model('Ebook', ebookSchema);

const enderecoSchema = new mongoose.Schema({
  logradouro: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  uf: { type: String, required: true },
  cep: { type: String, required: true }
})
const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  endereco: enderecoSchema
})
const pedidoSchema = new mongoose.Schema({
  id: { type: mongoose.Types.ObjectId },
  cliente: clienteSchema,
  itens: [{ ebookId: mongoose.Types.ObjectId}],
})
const Pedido = mongoose.model('Pedido', pedidoSchema);

db.on("error", console.log.bind(console, 'Erro de conexão'));
db.once("open", function () {
  console.log('Conexão ao banco feita com sucesso');
});


const app = express();
app.use(express.json());

app.get("/ebooks", async (_, res) => {
  try {
    const ebooks = await Ebook.find();
    res.status(200).json(ebooks);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
app.post('/ebooks', async (req, res) => {
  const ebook = new Ebook(req.body)
  await ebook.save();
  res.json(ebook);
});

app.get("/pedidos", async (_, res) => {
  try {
    const pedidos = await Pedido.find();
    res.status(200).json(pedidos);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
app.post('/pedidos', async (req, res) => {
  const pedido = new Pedido(req.body)
  await pedido.save();
  res.json(pedido);
});

export default app;
