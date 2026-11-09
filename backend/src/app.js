require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const criarSessao = require('./config/session');
const registrarRotas = require('./routes');
const { limiteGeral } = require('./middlewares/limiteRequisicoes');
const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/errorHandler');

/*
  Camadas (MVC), do pedido até o banco:
  - routes: URL e método HTTP -> middlewares e controller
  - middlewares: segurança, login, perfil de acesso e tratamento de erros
  - controllers: leem a requisição, chamam o service e devolvem a resposta
  - views: formatam o JSON que sai para o front
  - services: regras de negócio
  - models: validação dos dados
  - repositories: comandos SQL (MySQL)
*/
const app = express();

// Em produção a API fica atrás de proxies (do provedor e da Vercel). TRUST_PROXY
// diz quantos são, para o Express descobrir o IP real do visitante.
app.set('trust proxy', Number(process.env.TRUST_PROXY) || false);

app.use(helmet()); // cabeçalhos de segurança padrão
app.use(limiteGeral);

// Aceita uma ou mais origens, separadas por vírgula
app.use(cors({
  origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map((origem) => origem.trim()),
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(criarSessao());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Sistema de Vendas RGR',
}));

// Respostas da API não devem ficar guardadas em cache (dados mudam e são privados)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

registrarRotas(app);

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

module.exports = app;
