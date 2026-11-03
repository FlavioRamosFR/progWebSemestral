const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const pastaBanco = require('./pastaBanco');

fs.mkdirSync(pastaBanco, { recursive: true });

const db = new Database(path.join(pastaBanco, 'app.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senhaHash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('ADM', 'FUNCIONARIO'))
  );

  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    nomeFantasia TEXT NOT NULL DEFAULT '',
    documento TEXT NOT NULL DEFAULT '',
    telefone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    cep TEXT NOT NULL DEFAULT '',
    endereco TEXT NOT NULL DEFAULT '',
    cidade TEXT NOT NULL DEFAULT '',
    estado TEXT NOT NULL DEFAULT '',
    observacoes TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    valor REAL NOT NULL CHECK (valor > 0),
    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
    tamanho TEXT NOT NULL DEFAULT '',
    descricao TEXT NOT NULL DEFAULT '',
    imagem TEXT NOT NULL DEFAULT '',
    fornecedorId INTEGER REFERENCES fornecedores(id)
  );

  -- A venda guarda uma cópia de nome, categoria e valor do produto:
  -- assim os relatórios continuam corretos se o produto mudar ou for excluído.
  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produtoId INTEGER NOT NULL,
    nomeProduto TEXT NOT NULL,
    categoriaProduto TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valorUnitario REAL NOT NULL,
    usuarioId INTEGER NOT NULL REFERENCES usuarios(id),
    realizadaEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
