// Erro com status HTTP: o service lança e o tratadorDeErros responde ao cliente
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

module.exports = HttpError;
