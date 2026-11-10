// Configura os testes para usar o banco de TESTE (rgr_teste), nunca o banco principal
require('dotenv').config({ quiet: true });

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else {
  delete process.env.DATABASE_URL;
  process.env.DB_NAME = process.env.TEST_DB_NAME || 'rgr_teste';
}

process.env.SESSION_SECRET = 'segredo-dos-testes';
process.env.ADM_EMAIL = 'adm@teste.com';
process.env.ADM_SENHA = 'senha-adm';
process.env.FUNCIONARIO_EMAIL = 'func@teste.com';
process.env.FUNCIONARIO_SENHA = 'senha-func';
