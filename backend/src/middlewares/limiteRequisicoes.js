const { rateLimit } = require('express-rate-limit');

const QUINZE_MINUTOS = 15 * 60 * 1000;

function criarLimite({ limite, mensagem, ...opcoes }) {
  return rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit: limite,
    standardHeaders: 'draft-8', // informa ao cliente quantas requisições restam
    legacyHeaders: false,
    handler: (req, res, next, opcoesDoLimite) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`Limite de requisições atingido: ${req.ip} ${req.method} ${req.originalUrl}`);
      }
      res.status(opcoesDoLimite.statusCode).json({ erro: mensagem });
    },
    ...opcoes,
  });
}

// Limite geral por IP: barra robôs e excesso de requisições que poderiam derrubar a API
const limiteGeral = criarLimite({
  limite: Number(process.env.LIMITE_GERAL) || 300,
  mensagem: 'Muitas requisições. Aguarde alguns minutos e tente novamente.',
});

// Limite do login: dificulta tentar várias senhas (força bruta).
// Logins bem-sucedidos não contam.
const limiteLogin = criarLimite({
  limite: Number(process.env.LIMITE_LOGIN) || 10,
  mensagem: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
  skipSuccessfulRequests: true,
});

module.exports = { limiteGeral, limiteLogin };
