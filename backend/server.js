const app = require('./src/app');
const { pool } = require('./src/config/database');
const criarUsuariosIniciais = require('./src/config/seed');

const PORTA = process.env.PORT || 3001;

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    await criarUsuariosIniciais();
  } catch (erro) {
    console.error('Não foi possível conectar ao banco de dados:', erro.message);
    console.error('Confira as variáveis do banco no .env e se as tabelas foram criadas (npm run db:criar).');
    process.exit(1);
  }

  app.listen(PORTA, () => {
    console.log(`API rodando em http://localhost:${PORTA}`);
    console.log(`Documentação em http://localhost:${PORTA}/docs`);
  });
}

iniciar();
