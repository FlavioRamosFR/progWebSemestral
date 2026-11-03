const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const pastaBanco = require('./pastaBanco');

const TRINTA_MINUTOS = 1000 * 60 * 30;

function criarSessao() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('Defina SESSION_SECRET no arquivo .env (veja o .env.example)');
  }

  return session({
    store: new SQLiteStore({ db: 'sessoes.db', dir: pastaBanco }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: TRINTA_MINUTOS,
      httpOnly: true, // o JavaScript do navegador não consegue ler o cookie
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  });
}

module.exports = criarSessao;
