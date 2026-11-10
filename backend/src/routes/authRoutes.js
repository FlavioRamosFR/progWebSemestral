const express = require('express');
const controller = require('../controllers/AuthController');
const exigeLogin = require('../middlewares/exigeLogin');
const { limiteLogin } = require('../middlewares/limiteRequisicoes');

const router = express.Router();

router.post('/login', limiteLogin, controller.login);
router.get('/perfil', exigeLogin, controller.perfil);
router.post('/logout', controller.logout);

module.exports = router;
