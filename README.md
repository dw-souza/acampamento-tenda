# Acampamento Tenda

Sistema da Secretaria dos acampamentos da Comunidade Tenda: inscrições, tendas,
equipes de trabalho, tesouraria e crachás.

## Stack

Next.js (App Router) · Drizzle ORM · Postgres (Neon em produção) · Better Auth · shadcn/ui · Vitest

## Rodando localmente

Requisitos: Node 24 e Docker.

```bash
npm install
cp .env.example .env.local        # preencha BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:up                     # Postgres local na porta 5433
npm run db:migrate
npm run db:seed                   # etapas e equipes
npm run user:create -- "Seu Nome" voce@exemplo.com uma-senha
npm run dev
```

## Deploy (Vercel + Neon)

1. Importe o repositório na Vercel (preset Next.js).
2. Em **Storage**, crie um banco **Neon** e conecte ao projeto: a integração injeta
   `DATABASE_URL` e `DATABASE_URL_UNPOOLED`. Ative o branch de banco por preview.
3. Defina `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) e `BETTER_AUTH_URL`
   (URL de produção) nas variáveis de ambiente.
4. Deploy. O build (`vercel-build`) aplica as migrations antes do `next build`.
5. Uma vez, com a [CLI da Vercel](https://vercel.com/docs/cli) logada e o projeto linkado (`vercel link`):

```bash
npm run prod:env                                   # baixa as variáveis para .env.production.local
npm run prod:seed                                  # etapas e equipes
npm run prod:user:create -- "Nome" email@exemplo.com senha
```

## Scripts

| Script                | O que faz                                  |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Servidor de desenvolvimento                |
| `npm run typecheck`   | Gera os tipos de rota e roda o `tsc`       |
| `npm test`            | Testes de domínio (Vitest)                 |
| `npm run db:generate` | Gera migration a partir de `src/db/schema` |
| `npm run db:migrate`  | Aplica migrations pendentes                |
| `npm run db:studio`   | Drizzle Studio                             |
| `npm run user:create` | Cria um usuário (não há cadastro público)  |

## Organização

```
src/
  app/(admin)/     telas autenticadas
  app/login/       login
  db/schema/       schema do banco (auth + domínio)
  lib/dal.ts       requireUser(): checagem de sessão usada em toda leitura/escrita
  lib/domain/      regras de negócio puras e testadas (valores, pajem…)
  proxy.ts         redirecionamento otimista para /login
scripts/           seed e criação de usuário
```

## Modelo, em resumo

- **Família** é a unidade (casal + filhos, em `people`). Pertence a uma paróquia e, a partir do Kerigma, a uma tenda.
- **Tenda** nasce com status `forming` junto do Kerigma (uma por paróquia) e vira `active` quando as inscrições fecham. Avança de etapa ao longo dos anos (`tent_stage_history`).
- **Acampamento** pertence a uma etapa. Cada família tem uma única participação por acampamento (`camp_participants`: campista ou servo, equipe, pagamento), e `camp_attendees` registra quem da família vai de fato.
- **Valor esperado** é calculado por pessoa presente; menores de 3 anos não pagam e contam para o pajem. Pagamento nunca bloqueia participação.
