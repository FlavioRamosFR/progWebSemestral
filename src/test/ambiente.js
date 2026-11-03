const fs = require('fs');
const os = require('os');
const path = require('path');

// Cada arquivo de teste roda com um banco próprio e vazio, em uma pasta temporária
process.env.PASTA_BANCO = fs.mkdtempSync(path.join(os.tmpdir(), 'rgr-teste-'));
process.env.SESSION_SECRET = 'segredo-dos-testes';
process.env.ADM_EMAIL = 'adm@teste.com';
process.env.ADM_SENHA = 'senha-adm';
process.env.FUNCIONARIO_EMAIL = 'func@teste.com';
process.env.FUNCIONARIO_SENHA = 'senha-func';
