function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// O Express 5 encaminha para cá qualquer erro lançado em uma rota
function tratadorDeErros(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err.stack);
    return res.status(status).json({ erro: 'Erro interno do servidor' });
  }

  res.status(status).json({ erro: err.message });
}

module.exports = { rotaNaoEncontrada, tratadorDeErros };
