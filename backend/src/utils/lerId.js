const HttpError = require('./HttpError');

// Converte o :id da URL em número. Um id inválido é tratado como inexistente.
function lerId(req) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(404, 'Registro não encontrado');
  }

  return id;
}

module.exports = lerId;
