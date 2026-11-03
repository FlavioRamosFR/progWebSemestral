const authRoutes = require('./authRoutes');
const produtoRoutes = require('./produtoRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const relatorioRoutes = require('./relatorioRoutes');

// As URLs em inglês são as que o front já consome
function registrarRotas(app) {
  app.use('/', authRoutes);
  app.use('/products', produtoRoutes);
  app.use('/providers', fornecedorRoutes);
  app.use('/reports', relatorioRoutes);
}

module.exports = registrarRotas;
