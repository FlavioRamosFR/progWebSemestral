// Antes de cada arquivo de teste: esvazia as tabelas e recria os usuários.
// Depois do arquivo: fecha as conexões com o banco.
const { pool } = require('../config/database');
const criarUsuariosIniciais = require('../config/seed');

const TABELAS = ['sessions', 'vendas', 'produtos', 'fornecedores', 'usuarios'];

// Proteção: nunca apagar dados de um banco que não seja de teste
async function confirmarBancoDeTeste() {
  const [[{ banco }]] = await pool.query('SELECT DATABASE() AS banco');

  if (!/teste|test/i.test(banco)) {
    throw new Error(`Os testes só rodam em um banco de teste, mas o banco atual é "${banco}"`);
  }
}

beforeAll(async () => {
  await confirmarBancoDeTeste();

  const conexao = await pool.getConnection();
  try {
    await conexao.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const tabela of TABELAS) {
      await conexao.query(`TRUNCATE TABLE ${tabela}`);
    }
    await conexao.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conexao.release();
  }

  await criarUsuariosIniciais();
});

afterAll(async () => {
  await pool.end();
});
