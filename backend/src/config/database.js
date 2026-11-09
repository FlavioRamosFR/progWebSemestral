const mysql = require('mysql2/promise');

// Fuso usado nas datas das vendas. Mato Grosso do Sul: -04:00. Brasília: -03:00.
const FUSO_HORARIO = process.env.DB_TIMEZONE || '-04:00';

// SSL é exigido pela maioria dos bancos em nuvem. DB_SSL_CA recebe o certificado
// do provedor (o conteúdo do arquivo .pem), quando ele fornece um.
function configurarSsl() {
  if (process.env.DB_SSL !== 'true') return undefined;

  return {
    ca: process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined,
    rejectUnauthorized: true,
  };
}

// Aceita uma URL completa (DATABASE_URL), como a que os provedores fornecem,
// ou as variáveis separadas DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME.
function lerConexao() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);

    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

const pool = mysql.createPool({
  ...lerConexao(),
  ssl: configurarSsl(),
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  namedPlaceholders: true, // permite :nome nos comandos SQL
  decimalNumbers: true, // DECIMAL volta como número, não como texto
  dateStrings: true, // DATETIME volta como texto "AAAA-MM-DD HH:MM:SS"
  timezone: FUSO_HORARIO,
});

// Cada nova conexão usa o fuso definido, para que CURRENT_TIMESTAMP e DATE()
// sigam a data local da loja, e não a do servidor em nuvem
pool.on('connection', (conexao) => {
  conexao.query('SET time_zone = ?', [FUSO_HORARIO]);
});

// Executa a função dentro de uma transação: ou tudo é gravado, ou nada é
async function emTransacao(funcao) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const resultado = await funcao(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { pool, emTransacao };
