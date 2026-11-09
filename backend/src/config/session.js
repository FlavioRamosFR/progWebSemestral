const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./database');

const TRINTA_MINUTOS = 1000 * 60 * 30;

function criarSessao() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('Defina SESSION_SECRET no arquivo .env (veja o .env.example)');
  }

  // As sessões ficam na tabela "sessions", criada pelo sql/schema.sql
  const armazenamento = new MySQLStore({
    createDatabaseTable: false,
    clearExpired: process.env.NODE_ENV !== 'test', // limpa sessões vencidas a cada 15 min
    endConnectionOnClose: false,
  }, pool);

  return session({
    store: armazenamento,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: TRINTA_MINUTOS,
      httpOnly: true, // o JavaScript do navegador não consegue ler o cookie
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // em produção, só por HTTPS
    },
  });
}

module.exports = criarSessao;
