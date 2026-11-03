const express = require('express');
const controller = require('../controllers/ProdutoController');
const exigeLogin = require('../middlewares/exigeLogin');
const exigePerfil = require('../middlewares/exigePerfil');
const { PERFIS } = require('../models/Usuario');

const router = express.Router();

// Toda rota de produtos exige login
router.use(exigeLogin);

// ADM e Funcionário: consultar e vender
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.patch('/:id/sale', controller.registrarVenda);

// Somente ADM: alterar o cadastro e o estoque
router.post('/', exigePerfil(PERFIS.ADM), controller.criar);
router.put('/:id', exigePerfil(PERFIS.ADM), controller.atualizar);
router.delete('/:id', exigePerfil(PERFIS.ADM), controller.excluir);

module.exports = router;
