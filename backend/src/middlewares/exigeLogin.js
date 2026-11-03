// Autenticação: só deixa passar quem tem uma sessão ativa (401 = não logado)
function exigeLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar' });
  }

  next();
}

module.exports = exigeLogin;
