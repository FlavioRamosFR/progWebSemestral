const request = require('supertest');
const app = require('../app');

// O agente do supertest guarda o cookie de sessão entre as requisições
async function logarComo(email, senha) {
  const agente = request.agent(app);
  await agente.post('/login').send({ username: email, password: senha }).expect(200);
  return agente;
}

const logarComoAdm = () => logarComo('adm@teste.com', 'senha-adm');
const logarComoFuncionario = () => logarComo('func@teste.com', 'senha-func');

const PRODUTO_VALIDO = {
  sku: 'CAM-001',
  nome: 'Camiseta',
  categoria: 'Camisa',
  valor: 50,
  quantidade: 30,
  tamanho: 'M',
  descricao: 'Camiseta básica',
};

module.exports = { app, logarComoAdm, logarComoFuncionario, PRODUTO_VALIDO };
