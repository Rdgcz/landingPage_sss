// Configuração inicial (SEMPRE no topo)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Novo pacote de segurança
const rateLimit = require('express-rate-limit'); // Novo pacote para limitar requisições

// Debug inicial (opcional mas recomendado)
console.log("\n🛠️  Variáveis de ambiente carregadas:");
console.log("   Porta:", process.env.PORT);
console.log("   Bucket:", process.env.FIREBASE_STORAGE_BUCKET);
console.log("   Ambiente:", process.env.NODE_ENV || 'desenvolvimento', "\n");

// Inicialização do Express
const app = express();

// ======================
// MIDDLEWARES (Filtros)
// ======================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Controle de origens
  optionsSuccessStatus: 200
}));

app.use(helmet()); // Proteção contra vulnerabilidades web
app.use(express.json({ limit: '10mb' })); // Limite para uploads

// Limitar requisições (DDoS protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// =============
// ROTAS
// =============
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend do Sítio Sabiá está vivo! 🎉',
    documentation: process.env.DOCS_URL || 'http://localhost:3001/api-docs'
  });
});

// Rotas da API
const storageRoutes = require('./routes/storageRoutes');
app.use('/api/storage', storageRoutes);

// =============
// ERROS
// =============
// Rota não encontrada (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Manipulador global de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno no servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============
// SERVIDOR
// =============
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`   Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Acesse: http://localhost:${PORT}\n`);
});

