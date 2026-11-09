const { pool } = require('../config/database');

async function contarUsuarios() {
  const [linhas] = await pool.execute('SELECT COUNT(*) AS total FROM usuarios');
  return linhas[0].total;
}

async function buscarPorEmail(email) {
  const [linhas] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return linhas[0];
}

async function criarUsuario({ nome, email, senhaHash, perfil }) {
  await pool.execute(
    'INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (?, ?, ?, ?)',
    [nome, email.toLowerCase(), senhaHash, perfil],
  );
}

module.exports = { contarUsuarios, buscarPorEmail, criarUsuario };
