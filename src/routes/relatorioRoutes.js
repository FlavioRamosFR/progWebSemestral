const express = require('express');
const controller = require('../controllers/RelatorioController');
const exigeLogin = require('../middlewares/exigeLogin');
const exigePerfil = require('../middlewares/exigePerfil');
const { PERFIS } = require('../models/Usuario');

const router = express.Router();

// Relatórios são exclusivos do ADM (gerente/chefe)
router.use(exigeLogin, exigePerfil(PERFIS.ADM));

router.get('/', controller.completo);
router.get('/sales/summary', controller.resumo);
router.get('/sales/analysis', controller.analise);
router.get('/sales/top-products', controller.produtosMaisVendidos);

module.exports = router;
