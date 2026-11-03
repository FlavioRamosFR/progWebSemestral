const express = require('express');
const controller = require('../controllers/FornecedorController');
const exigeLogin = require('../middlewares/exigeLogin');
const exigePerfil = require('../middlewares/exigePerfil');
const { PERFIS } = require('../models/Usuario');

const router = express.Router();

// Toda rota de fornecedores exige login
router.use(exigeLogin);

// ADM e Funcionário: consultar
router.get('/', controller.listar);
router.get('/:id', controller.buscar);

// Somente ADM: alterar o cadastro
router.post('/', exigePerfil(PERFIS.ADM), controller.criar);
router.put('/:id', exigePerfil(PERFIS.ADM), controller.atualizar);
router.delete('/:id', exigePerfil(PERFIS.ADM), controller.excluir);

module.exports = router;
