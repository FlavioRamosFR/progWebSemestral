const service = require('../services/AuthService');
const HttpError = require('../utils/HttpError');

// O front envia username e password; email e senha também são aceitos
async function login(req, res, next) {
  const { username, email, password, senha } = req.body ?? {};

  let usuario;
  try {
    usuario = await service.autenticar(username ?? email, password ?? senha);
  } catch (erro) {
    // O IP no log ajuda a conferir, em produção, se o rate limit enxerga o visitante real
    if (process.env.NODE_ENV !== 'test') console.warn(`Login recusado para o IP ${req.ip}`);
    throw erro;
  }

  // Gera um novo id de sessão no login para evitar o roubo de uma sessão anterior
  req.session.regenerate((erro) => {
    if (erro) return next(erro);

    req.session.usuario = usuario;
    req.session.logadoEm = new Date().toISOString();

    res.status(200).json({ mensagem: 'Sessão iniciada com sucesso', usuario });
  });
}

function perfil(req, res) {
  res.status(200).json({ usuario: req.session.usuario, logadoEm: req.session.logadoEm });
}

function logout(req, res, next) {
  req.session.destroy((erro) => {
    if (erro) return next(new HttpError(500, 'Erro ao encerrar a sessão'));

    res.clearCookie('connect.sid');
    res.status(200).json({ mensagem: 'Sessão encerrada' });
  });
}

module.exports = { login, perfil, logout };
