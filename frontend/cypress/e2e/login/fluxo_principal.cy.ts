describe('Fluxo Principal do Sistema de Vendas', () => {
  
  // CT_FRONT_01: Bloqueio de rotas
  it('Deve redirecionar para o login se acessar rota interna sem sessão', () => {
    // Tenta acessar a página de vendas diretamente
    cy.visit('/produtos');
    
    // Verifica se o sistema barrou e mandou de volta para o login
    cy.url().should('include', '/');
  });

  // CT_FRONT_02: Login bem-sucedido
  it('Deve realizar login e carregar o dashboard', () => {
    cy.visit('/login');

    // Substitua os seletores abaixo pelos names ou IDs reais do seu LoginSection
    cy.get('input[name="email"]').type('admin@rgr.com');
    cy.get('input[name="senha"]').type('gargadezembro');
    cy.get('button[type="submit"]').click();

    // Verifica se a URL mudou para a área logada e se algum elemento chave apareceu
    cy.url().should('not.include', '/login');
    cy.contains('Bem-vindo').should('be.visible'); 
  });

  // CT_FRONT_03: Fluxo de Venda UI
  it('Deve registrar uma venda pela interface', () => {
    // 1. Logar primeiro (o Cypress limpa o estado entre os testes)
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@rgr.com');
    cy.get('input[name="senha"]').type('gargadezembro');
    cy.get('button[type="submit"]').click();

    // 2. Navegar até a tela de produtos/vendas
    cy.visit('/produtos');

    // 3. Simular o clique no botão de vender do primeiro produto da lista
    // Ajuste o seletor para o botão de ação da sua tabela
    cy.get('button').contains('Vender').first().click();

    // 4. Preencher a quantidade no modal ou formulário que abrir
    cy.get('input[name="quantidadeVendida"]').type('2');
    
    // 5. Confirmar a venda
    cy.get('button').contains('Confirmar').click();

    // 6. Validar o feedback na tela (ex: Toast do Mantine ou notificação)
    cy.contains('Venda registrada com sucesso').should('be.visible');
  });
});