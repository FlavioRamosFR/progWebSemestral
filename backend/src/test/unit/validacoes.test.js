const { validarProduto, normalizarProduto } = require('../../models/Produto');
const Relatorio = require('../../models/Relatorio');
const RelatorioService = require('../../services/RelatorioService');
const VendaRepository = require('../../repositories/VendaRepository'); 
const lerId = require('../../utils/lerId');
const HttpError = require('../../utils/HttpError');
const { validarPeriodo } = require('../../models/Relatorio');

jest.mock('../../repositories/VendaRepository');

describe('Testes Unitários - Validações e Utilitários', () => {

  // CT103 e CT104: Validação de Produto
  it('CT103/CT104: deve validar e rejeitar produtos inválidos', () => {
    //do model 
    const prodValido = {
      sku: 'CAM-001',
      nome: 'Camiseta',
      categoria: 'Camisa',
      valor: 50,
      quantidade: 30,
      fornecedorId: null
    };
    expect(validarProduto(prodValido).length).toBe(0);
    const prodInvalidos = { nome: '', categoria: '', valor: -1, quantidade: -1, fornecedorId: 'invalido' };
    const erros = validarProduto(prodInvalidos);
    expect(erros.length).toBeGreaterThan(0);
  });

  // CT105: Normalização de Produto (pt e eng)
  it('CT105: deve normalizar campos em português e inglês', () => {
    const entradaIngles = { name: 'Hat', price: 25, quantity: 5 };
    const normalizado = normalizarProduto(entradaIngles);
    expect(normalizado.nome).toBe('Hat');
    expect(normalizado.valor).toBe(25);
  });

  // CT107: Validação de Período de Datas
  it('CT107: deve validar regras de período de datas', () => {
    // Válido
    expect(validarPeriodo({ dataInicio: '2026-10-01', dataFim: '2026-10-31' }).length).toBe(0);

    // inicio < fim
    const erroInvertido = validarPeriodo({ dataInicio: '2026-10-31', dataFim: '2026-10-01' });
    expect(erroInvertido).toContain('dataInicio não pode ser maior que dataFim');

    // datas inexistentes
    const erroInexistente = validarPeriodo({ dataInicio: '2026-02-31', dataFim: '2026-03-01' });
    expect(erroInexistente).toContain('Informe dataInicio e dataFim no formato AAAA-MM-DD');
  });

  // CT111: lerId
  it('CT111: deve converter IDs ou lançar HttpError 404', () => {
    expect(lerId({ params: { id: '7' } })).toBe(7);
    expect(() => lerId({ params: { id: 'abc' } })).toThrow(HttpError);
  });

  it('CT112: deve calcular resumo com zero vendas sem divisão por zero', () => {
    // zero vendas
    VendaRepository.totaisDoPeriodo.mockReturnValue({
      faturamentoTotal: 0,
      vendasRealizadas: 0,
      itensVendidos: 0
    });

    // chama o serviço passando o formato exato que ele exige
    const filtro = { dataInicio: '2026-01-01', dataFim: '2026-12-31' };
    const resumoZero = RelatorioService.calcularResumo(filtro);

    // verificação se o ticket médio é zero e não houve divisão por zero
    expect(resumoZero.vendasRealizadas).toBe(0);
    expect(resumoZero.faturamentoTotal).toBe(0);
    expect(resumoZero.ticketMedio).toBe(0);
  });

  it('CT112: deve calcular resumo e ticket médio corretamente com vendas', () => {
    // simulação de banco de dados retornando totais agregados das vendas
    VendaRepository.totaisDoPeriodo.mockReturnValue({
      faturamentoTotal: 100,
      vendasRealizadas: 3,
      itensVendidos: 3
    });

    // serviço passando o filtro de datas
    const filtro = { dataInicio: '2026-01-01', dataFim: '2026-12-31' };
    const resumo = RelatorioService.calcularResumo(filtro);

    // verificação dos calculos
    expect(resumo.vendasRealizadas).toBe(3);
    expect(resumo.faturamentoTotal).toBe(100);
    expect(resumo.ticketMedio).toBe(33.33);
  });

});