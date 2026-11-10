const bcrypt = require('bcryptjs');
const repository = require('../repositories/UsuarioRepository');
const HttpError = require('../utils/HttpError');

// A mesma mensagem para e-mail e senha errados não revela quais e-mails existem
async function autenticar(email, senha) {
  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new HttpError(401, 'Credenciais inválidas');
  }

  const usuario = await repository.buscarPorEmail(email.trim().toLowerCase());

  if (!usuario || !await bcrypt.compare(senha, usuario.senhaHash)) {
    throw new HttpError(401, 'Credenciais inválidas');
  }

  return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
}

module.exports = { autenticar };
