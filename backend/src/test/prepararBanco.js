// Executado uma vez antes de todos os testes: cria as tabelas no banco de teste
require('./ambiente');
const { pool } = require('../config/database');
const { criarEstrutura } = require('../config/estruturaBanco');

module.exports = async function prepararBanco() {
  await criarEstrutura(pool);
  await pool.end();
};
