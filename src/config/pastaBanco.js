const path = require('path');

// Os testes usam uma pasta temporária para não mexer no banco de verdade
module.exports = process.env.PASTA_BANCO || path.join(__dirname, '..', '..', 'database');
