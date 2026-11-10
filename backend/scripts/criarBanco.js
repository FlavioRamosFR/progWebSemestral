// Cria as tabelas do sql/schema.sql no banco configurado no .env.
// Uso: npm run db:criar
require('dotenv').config({ quiet: true });
const { pool } = require('../src/config/database');
const { criarEstrutura } = require('../src/config/estruturaBanco');

async function executar() {
  try {
    await criarEstrutura(pool);
    console.log('Tabelas criadas ou já existentes.');
  } catch (erro) {
    console.error('Não foi possível criar as tabelas:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executar();
