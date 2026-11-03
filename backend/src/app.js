require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const criarSessao = require('./config/session');
const criarUsuariosIniciais = require('./config/seed');
const registrarRotas = require('./routes');
const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/errorHandler');

/*
  Camadas (MVC), do pedido até o banco:
  - routes: URL e método HTTP -> middlewares e controller
  - middlewares: login, perfil de acesso e tratamento de erros
  - controllers: leem a requisição, chamam o service e devolvem a resposta
  - views: formatam o JSON que sai para o front
  - services: regras de negócio
  - models: validação dos dados
  - repositories: comandos SQL
*/
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(criarSessao());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Sistema de Vendas RGR',
}));

criarUsuariosIniciais();
registrarRotas(app);

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

module.exports = app;
