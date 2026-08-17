const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  res.json({ mensagem: 'API Sistema de Chamados', versao: '1.0.0' });
});

app.use(express.static(frontendPath));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
