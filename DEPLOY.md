# Deploy do Sistema de Vendas RGR

Este guia publica as três partes do sistema a partir deste mesmo repositório do GitHub:

| Parte | Onde | Pasta do repositório |
| --- | --- | --- |
| Banco MySQL | Railway | `backend/sql/schema.sql` |
| API (back-end) | Railway, no mesmo projeto do banco | `backend/` |
| Site (front-end) | Vercel | `frontend/` |

```
Navegador ──> Vercel (site Next.js) ──/api/...──> Railway (API Express) ──> Railway (MySQL)
```

O navegador só conversa com o site na Vercel. As chamadas para `/api/...` são repassadas pela Vercel para a API, então o cookie de login fica no domínio do site.

> **Custos:** o Railway cobra pelo uso e costuma oferecer um crédito de teste; a Vercel tem plano gratuito (Hobby). Planos mudam com frequência, então confira os valores atuais antes de começar. Em novembro de 2026, o plano gratuito de MySQL da Aiven tinha sido encerrado, e por isso ele não é usado aqui.

## Antes de começar

1. Todo o código precisa estar na branch `main` do GitHub.
2. Crie contas no [Railway](https://railway.com) e na [Vercel](https://vercel.com), entrando com o GitHub.
3. Gere um segredo para a sessão (guarde para o passo 3):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Escolha senhas fortes para os usuários ADM e Funcionário. Elas valem para o sistema publicado, então não use as senhas de teste.

## 1. Criar o banco MySQL (Railway)

1. No Railway, clique em **New Project** e escolha **Database > MySQL**.
2. Abra o serviço MySQL e vá na aba **Variables**. Ali ficam os dados de conexão. Você vai precisar de dois:
   - a URL interna (geralmente `MYSQL_URL`), usada pela API dentro do Railway;
   - a URL pública (geralmente `MYSQL_PUBLIC_URL`), usada para criar as tabelas do seu computador.

## 2. Criar as tabelas em produção

O arquivo que sobe a estrutura do banco é o [`backend/sql/schema.sql`](backend/sql/schema.sql). Ele só cria o que não existe, então pode ser rodado de novo sem apagar dados. Use **uma** das formas:

**Opção A: pelo seu computador, com o script do projeto**

```bash
cd backend
DATABASE_URL="cole_aqui_a_URL_publica" npm run db:criar
```

No PowerShell, defina a variável antes:

```powershell
cd backend
$env:DATABASE_URL="cole_aqui_a_URL_publica"; npm run db:criar
```

Deve aparecer `Tabelas criadas ou já existentes.`

**Opção B: pelo MySQL Workbench**

Crie uma conexão com o host, a porta, o usuário e a senha da URL pública, abra o `backend/sql/schema.sql` e execute o arquivo inteiro (ícone do raio).

Não é preciso inserir usuários: a API cria o ADM e o Funcionário na primeira vez que sobe.

## 3. Publicar a API (Railway)

1. No mesmo projeto do Railway, clique em **New > GitHub Repo** e escolha este repositório.
2. Em **Settings** do novo serviço:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start` (o Railway costuma detectar sozinho)
   - **Healthcheck Path:** `/saude`
3. Em **Variables**, cadastre:

   | Variável | Valor |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | a URL **interna** do MySQL (no Railway, dá para referenciar a variável do serviço MySQL em vez de colar o valor) |
   | `SESSION_SECRET` | o segredo gerado antes |
   | `ADM_EMAIL` / `ADM_SENHA` | e-mail e senha forte do gerente |
   | `FUNCIONARIO_EMAIL` / `FUNCIONARIO_SENHA` | e-mail e senha forte do funcionário |
   | `DB_TIMEZONE` | `-04:00` (Mato Grosso do Sul) |
   | `TRUST_PROXY` | `2` (ajuste no passo 6) |
   | `FRONTEND_ORIGIN` | o endereço da Vercel (preencha depois do passo 4) |

   O `PORT` é definido pelo próprio Railway, não cadastre.

4. Em **Settings > Networking**, clique em **Generate Domain** para a API ganhar um endereço público, como `https://rgr-api.up.railway.app`.
5. Teste no navegador: `https://SEU-ENDERECO/saude` deve responder `{"status":"ok"}`, e `https://SEU-ENDERECO/docs` deve abrir o Swagger.

Se a API não subir, abra **Deployments > View logs**. A mensagem `Não foi possível conectar ao banco de dados` indica erro na `DATABASE_URL` ou tabelas não criadas.

## 4. Publicar o site (Vercel)

1. Na Vercel, clique em **Add New > Project** e importe este repositório.
2. Em **Root Directory**, escolha `frontend`. A Vercel detecta o Next.js sozinha.
3. Em **Environment Variables**, cadastre:

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `/api` |
   | `API_URL` | o endereço da API do passo 3, **sem barra no final** |

4. Clique em **Deploy**. Ao terminar, a Vercel mostra o endereço do site, como `https://rgr.vercel.app`.

Se mudar o `API_URL` depois, faça um novo deploy (**Deployments > Redeploy**): o repasse do `/api` é montado durante o build.

## 5. Ligar o site à API

1. Volte ao Railway e preencha `FRONTEND_ORIGIN` com o endereço da Vercel (sem barra no final). O Railway refaz o deploy da API.
2. Abra `https://SEU-SITE.vercel.app/login`, entre como ADM e teste: cadastrar fornecedor, cadastrar produto, registrar venda e gerar relatório.
3. Entre como Funcionário e confira que o relatório mostra a tela de acesso proibido.

## 6. Conferir a proteção contra abuso (rate limit)

A API limita cada IP a 300 requisições e a 10 tentativas de login erradas a cada 15 minutos. Para isso funcionar, ela precisa enxergar o IP real de quem acessa, e não o IP da Vercel ou do Railway. É o que o `TRUST_PROXY` controla.

1. Descubra o seu IP em um site como `https://api.ipify.org`.
2. No site publicado, tente entrar com uma senha errada.
3. Nos logs da API no Railway, procure a linha `Login recusado para o IP ...`:
   - **Aparece o seu IP:** está certo.
   - **Aparece outro IP** (de servidor): aumente o `TRUST_PROXY` em 1 e repita.
   - **Aparece um IP diferente a cada tentativa, ou o mesmo IP para pessoas diferentes:** o valor está errado; volte para o número em que aparecia o seu IP.

Com o valor certo, a 11ª senha errada seguida bloqueia o login daquele IP por 15 minutos, sem afetar os outros usuários.

**O que essa proteção cobre:** excesso de requisições de uma mesma origem, robôs e tentativas de adivinhar senhas. Ataques grandes, vindos de milhares de IPs ao mesmo tempo (DDoS), precisam de proteção no nível da rede, como a que a Vercel já aplica na frente do site. Os limites podem ser ajustados pelas variáveis `LIMITE_GERAL` e `LIMITE_LOGIN`.

## Checklist de produção

- [ ] `NODE_ENV=production` na API (o cookie de login só trafega por HTTPS)
- [ ] `SESSION_SECRET` longo e aleatório, diferente do usado no computador
- [ ] Senhas fortes para ADM e Funcionário, diferentes das de teste
- [ ] `backend/sql/schema.sql` executado no banco de produção
- [ ] `/saude` respondendo `{"status":"ok"}`
- [ ] `API_URL` na Vercel apontando para a API, sem barra no final
- [ ] `FRONTEND_ORIGIN` na API com o endereço da Vercel
- [ ] `TRUST_PROXY` conferido pelo log do login recusado
- [ ] Nenhum arquivo `.env` enviado ao GitHub (já estão no `.gitignore`)
- [ ] Links do site e da API preenchidos no README

## Atualizações

Cada `git push` na `main` faz o Railway e a Vercel publicarem a nova versão sozinhos. Se uma mudança alterar o banco, atualize o `backend/sql/schema.sql` e rode-o de novo no banco de produção antes do push.
