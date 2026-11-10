const bcrypt = require('bcryptjs');
const repository = require('../repositories/UsuarioRepository');
const { PERFIS } = require('../models/Usuario');

// Cria os usuários definidos no .env quando a tabela está vazia
async function criarUsuariosIniciais() {
  if (await repository.contarUsuarios() > 0) return;

  const usuarios = [
    { nome: 'Gerente', email: process.env.ADM_EMAIL, senha: process.env.ADM_SENHA, perfil: PERFIS.ADM },
    { nome: 'Funcionário', email: process.env.FUNCIONARIO_EMAIL, senha: process.env.FUNCIONARIO_SENHA, perfil: PERFIS.FUNCIONARIO },
  ];

  for (const { nome, email, senha, perfil } of usuarios) {
    if (email && senha) {
      await repository.criarUsuario({ nome, email, senhaHash: await bcrypt.hash(senha, 10), perfil });
    }
  }

  if (await repository.contarUsuarios() === 0) {
    console.warn('Nenhum usuário criado: defina ADM_EMAIL e ADM_SENHA no arquivo .env');
  }
}

module.exports = criarUsuariosIniciais;
