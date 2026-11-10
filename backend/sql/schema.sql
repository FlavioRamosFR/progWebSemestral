-- Estrutura do banco do Sistema de Vendas RGR (MySQL 8 ou MariaDB 10.4+)
--
-- Rode este arquivo uma vez no banco de produção, antes de subir a API:
--   pelo console SQL do provedor, pelo MySQL Workbench ou com "npm run db:criar".
-- Ele pode ser executado de novo sem apagar dados: só cria o que ainda não existe.

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senhaHash VARCHAR(255) NOT NULL,
  perfil ENUM('ADM', 'FUNCIONARIO') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  nomeFantasia VARCHAR(150) NOT NULL DEFAULT '',
  documento VARCHAR(30) NOT NULL DEFAULT '',
  telefone VARCHAR(30) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  cep VARCHAR(10) NOT NULL DEFAULT '',
  endereco VARCHAR(255) NOT NULL DEFAULT '',
  cidade VARCHAR(100) NOT NULL DEFAULT '',
  estado VARCHAR(2) NOT NULL DEFAULT '',
  observacoes VARCHAR(1000) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  quantidade INT NOT NULL CHECK (quantidade >= 0),
  tamanho VARCHAR(20) NOT NULL DEFAULT '',
  descricao VARCHAR(1000) NOT NULL DEFAULT '',
  imagem VARCHAR(1000) NOT NULL DEFAULT '',
  fornecedorId INT NULL,
  CONSTRAINT fk_produtos_fornecedor FOREIGN KEY (fornecedorId) REFERENCES fornecedores (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A venda guarda uma cópia de nome, categoria e valor do produto:
-- assim os relatórios continuam corretos se o produto mudar ou for excluído.
-- Por isso produtoId não tem chave estrangeira.
CREATE TABLE IF NOT EXISTS vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produtoId INT NOT NULL,
  nomeProduto VARCHAR(150) NOT NULL,
  categoriaProduto VARCHAR(100) NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  valorUnitario DECIMAL(10, 2) NOT NULL,
  usuarioId INT NOT NULL,
  realizadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vendas_realizada_em (realizadaEm),
  CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuarioId) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessões de login, no formato usado pela biblioteca express-mysql-session
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
