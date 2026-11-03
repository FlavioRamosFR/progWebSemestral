// Autorização: só deixa passar os perfis informados (403 = logado, sem permissão).
// Deve ser usado depois do exigeLogin. Exemplo: exigePerfil(PERFIS.ADM)
function exigePerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.session.usuario.perfil)) {
      return res.status(403).json({ erro: 'Seu perfil não tem permissão para esta ação' });
    }

    next();
  };
}

module.exports = exigePerfil;
