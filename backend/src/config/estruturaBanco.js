const fs = require('fs');
const path = require('path');

const ARQUIVO_SCHEMA = path.join(__dirname, '..', '..', 'sql', 'schema.sql');

// Lê o sql/schema.sql e devolve cada comando separadamente, sem os comentários
function lerComandosDoSchema() {
  return fs
    .readFileSync(ARQUIVO_SCHEMA, 'utf8')
    .split('\n')
    .filter((linha) => !linha.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((comando) => comando.trim())
    .filter(Boolean);
}

async function criarEstrutura(conexao) {
  for (const comando of lerComandosDoSchema()) {
    await conexao.query(comando);
  }
}

module.exports = { criarEstrutura };
