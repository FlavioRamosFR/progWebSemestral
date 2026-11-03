const bcrypt = require('bcryptjs');
const repository = require('../repositories/UsuarioRepository');
const { PERFIS } = require('../models/Usuario');

// Cria os usuários de demonstração definidos no .env quando a tabela está vazia
function criarUsuariosIniciais() {
  if (repository.contarUsuarios() > 0) return;

  const usuarios = [
    { nome: 'Gerente', email: process.env.ADM_EMAIL, senha: process.env.ADM_SENHA, perfil: PERFIS.ADM },
    { nome: 'Funcionário', email: process.env.FUNCIONARIO_EMAIL, senha: process.env.FUNCIONARIO_SENHA, perfil: PERFIS.FUNCIONARIO },
  ];

  usuarios
    .filter(({ email, senha }) => email && senha)
    .forEach(({ nome, email, senha, perfil }) => {
      repository.criarUsuario({ nome, email, senhaHash: bcrypt.hashSync(senha, 10), perfil });
    });

  if (repository.contarUsuarios() === 0) {
    console.warn('Nenhum usuário criado: defina ADM_EMAIL e ADM_SENHA no arquivo .env');
  }
}

module.exports = criarUsuariosIniciais;
