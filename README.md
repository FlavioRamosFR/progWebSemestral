# Sistema de Vendas RGR

Sistema de estoque e vendas de roupas, com login por perfil de acesso (ADM e Funcionário), cadastro de produtos e fornecedores, registro de vendas e relatórios.

| Pasta | Conteúdo | Endereço |
| --- | --- | --- |
| [`backend/`](backend/README.md) | API em Node.js e Express, com SQLite | `http://localhost:3001` |
| [`frontend/`](frontend/README.md) | Interface em Next.js e React | `http://localhost:3000` |

## Como executar

Use um terminal para cada parte.

**Backend**

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Antes de iniciar, preencha o segredo e as senhas no `backend/.env`. Os usuários são criados a partir desse arquivo na primeira execução. A documentação interativa da API fica em `http://localhost:3001/docs`.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Depois, acesse `http://localhost:3000/login`.

## Testes

```bash
cd backend
npm test
```
