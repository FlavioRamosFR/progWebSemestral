const app = require('./src/app');

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
  console.log(`Documentação em http://localhost:${PORTA}/docs`);
});
