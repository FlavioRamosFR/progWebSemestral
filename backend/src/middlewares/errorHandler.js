function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// Erros do MySQL que são culpa dos dados enviados, e não do servidor
const ERROS_DO_BANCO = {
  ER_DATA_TOO_LONG: [400, 'Um dos campos ultrapassa o tamanho máximo permitido'],
  ER_DUP_ENTRY: [409, 'Já existe um registro com esses dados'],
};

// O Express 5 encaminha para cá qualquer erro lançado em uma rota
function tratadorDeErros(err, req, res, next) {
  if (ERROS_DO_BANCO[err.code]) {
    const [status, mensagem] = ERROS_DO_BANCO[err.code];
    return res.status(status).json({ erro: mensagem });
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error(err.stack);
    return res.status(status).json({ erro: 'Erro interno do servidor' });
  }

  res.status(status).json({ erro: err.message });
}

module.exports = { rotaNaoEncontrada, tratadorDeErros };
