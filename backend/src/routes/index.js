const authRoutes = require('./authRoutes');
const produtoRoutes = require('./produtoRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const relatorioRoutes = require('./relatorioRoutes');
const { pool } = require('../config/database');

// As URLs em inglês são as que o front já consome
function registrarRotas(app) {
  // Usada pelo provedor de hospedagem para saber se a API e o banco estão no ar
  app.get('/saude', async (req, res) => {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  });

  app.use('/', authRoutes);
  app.use('/products', produtoRoutes);
  app.use('/providers', fornecedorRoutes);
  app.use('/reports', relatorioRoutes);
}

module.exports = registrarRotas;
