require('dotenv').config({ debug: true }); // Ativa debug para verificar carregamento do .env
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// =============================================
// 1. VERIFICAÇÃO DE AMBIENTE E INICIALIZAÇÃO DO FIREBASE
// =============================================

// Verificação das variáveis de ambiente críticas
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET'
];

console.log('Verificando variáveis de ambiente...');
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Variável de ambiente faltando: ${envVar}`);
    process.exit(1);
  }
});

// Inicialização robusta do Firebase
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    console.log('✅ Firebase Admin inicializado com sucesso');
  }

  // Teste de conexão imediata
  admin.auth().listUsers(1)
    .then(() => console.log('✅ Conexão com Firebase validada'))
    .catch(err => {
      console.error('❌ Falha na conexão com Firebase:', err.message);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Erro crítico na inicialização do Firebase:', error);
  process.exit(1);
}

// =============================================
// 2. CONFIGURAÇÃO AVANÇADA DO EXPRESS
// =============================================
const app = express();

// Configuração de segurança aprimorada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.firebasestorage.com"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuração de CORS dinâmica
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://sitiosabiosabia.com.br',
        'https://api.sitiosabiosabia.com.br'
      ]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Configuração de parsing de JSON com tratamento de erros
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('JSON malformado');
    }
  }
}));

// =============================================
// 3. SISTEMA DE AUTENTICAÇÃO APRIMORADO
// =============================================

// Middleware de autenticação com cache de tokens
const tokenCache = new Map();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      details: 'Token não fornecido ou formato inválido'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  // Verificação de cache
  if (tokenCache.has(idToken)) {
    const { decodedToken, expiresAt } = tokenCache.get(idToken);
    if (Date.now() < expiresAt) {
      req.user = decodedToken;
      return next();
    }
    tokenCache.delete(idToken);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Cache do token por 5 minutos (ajuste conforme necessidade)
    tokenCache.set(idToken, {
      decodedToken,
      expiresAt: Date.now() + 300000
    });
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Falha na autenticação:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado',
        solution: 'Renove o token de autenticação'
      });
    }
    
    res.status(401).json({ 
      error: 'Token inválido',
      details: error.message
    });
  }
};

// Rota de login otimizada
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Validação básica (em produção, faça no frontend)
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Dados incompletos',
      required: { email: 'string', password: 'string' }
    });
  }

  try {
    // Em produção, isso deve ser feito no frontend com Firebase Client SDK
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Geração de token customizado (para uso específico)
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      },
      token: customToken,
      expiresIn: '1h' // Informação para o cliente
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        solution: 'Verifique o email ou cadastre-se'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// 4. ROTAS PROTEGIDAS E GERENCIAMENTO DE ARQUIVOS
// =============================================

// Rota de status da API
app.get('/', (req, res) => {
  res.json({
    status: 'API ONLINE',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/login',
      userData: 'GET /api/user-data',
      files: 'POST /api/files/upload'
    }
  });
});

// Rota de dados do usuário
app.get('/api/user-data', authenticate, (req, res) => {
  res.json({
    message: 'Dados protegidos',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      metadata: {
        lastLogin: req.user.auth_time 
          ? new Date(req.user.auth_time * 1000).toISOString() 
          : null
      }
    },
    permissions: [] // Adicione lógica de permissões aqui
  });
});

// Rotas de arquivos
app.use('/api/files', authenticate, require('./routes/files'));

// =============================================
// 5. TRATAMENTO DE ERROS AVANÇADO
// =============================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Tratamento centralizado de erros
app.use((err, req, res, next) => {
  console.error('Erro:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const response = {
    error: 'Erro interno',
    requestId: req.id // Requer middleware de request-id
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
    response.stack = err.stack;
  }

  // Tratamento específico para erros de JSON
  if (err.message.includes('JSON malformado')) {
    return res.status(400).json({ 
      error: 'JSON inválido',
      solution: 'Verifique o formato dos dados enviados'
    });
  }

  res.status(err.status || 500).json(response);
});

// =============================================
// 6. INICIALIZAÇÃO DO SERVIDOR COM GRACEFUL SHUTDOWN
// =============================================
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`
  🚀 Servidor rodando em: http://${HOST}:${PORT}
  🔧 Ambiente: ${process.env.NODE_ENV || 'development'}
  🔒 Modo seguro: ${process.env.NODE_ENV === 'production' ? 'ATIVADO' : 'DESATIVADO'}
  
  ⏱️  ${new Date().toLocaleString()}
  `);
});

// Configuração aprimorada de Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Recebido sinal ${signal}. Iniciando desligamento...`);
  
  try {
    // 1. Parar de aceitar novas conexões
    server.close(() => {
      console.log('✅ Servidor HTTP parado');
    });

    // 2. Encerrar conexões do Firebase
    if (admin.apps.length) {
      await admin.app().delete();
      console.log('✅ Conexões do Firebase encerradas');
    }

    // 3. Limpar cache e outros recursos
    tokenCache.clear();
    
    console.log('✅ Desligamento concluído');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante o desligamento:', err);
    process.exit(1);
  }

  // Forçar desligamento após 8 segundos
  setTimeout(() => {
    console.error('⚠️ Desligamento forçado após timeout');
    process.exit(1);
  }, 8000);
};

// Captura de sinais
process.on('SIGTERM', () => shutdown('SIGTERM')); // Kubernetes/Docker
process.on('SIGINT', () => shutdown('SIGINT'));  // Ctrl+C

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('💥 ERRO NÃO CAPTURADO:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ PROMISE REJEITADA NÃO TRATADA:', reason);
});