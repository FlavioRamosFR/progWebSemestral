const exigeLogin = require('../../middlewares/exigeLogin'); 
const exigePerfil = require('../../middlewares/exigePerfil'); 

describe('Testes Unitários - Segurança e Middlewares', () => {
  let req, res, next;

  beforeEach(() => {
    // Inicializa a requisição com o objeto session vazio
    req = { session: {} }; 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('CT_SEC_01: exigeLogin deve retornar 401 se não houver usuário logado', () => {
    exigeLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('CT_SEC_02: exigePerfil deve retornar 403 se o perfil for insuficiente', () => {
    // Injeta o usuário na sessão com perfil FUNCIONARIO
    req.session.usuario = { perfil: 'FUNCIONARIO' };
    
    const middleware = exigePerfil('ADM');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('CT_SEC_03: exigePerfil deve chamar next() se o perfil for autorizado', () => {
    // Injeta o usuário na sessão com perfil ADM
    req.session.usuario = { perfil: 'ADM' };
    
    const middleware = exigePerfil('ADM');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});