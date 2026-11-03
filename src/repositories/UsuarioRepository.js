const db = require('../config/database');

function contarUsuarios() {
  return db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
}

function buscarPorEmail(email) {
  return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}

function criarUsuario({ nome, email, senhaHash, perfil }) {
  db.prepare('INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (?, ?, ?, ?)')
    .run(nome, email.toLowerCase(), senhaHash, perfil);
}

module.exports = { contarUsuarios, buscarPorEmail, criarUsuario };
